from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import Response
from PIL import Image, ImageOps
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.excel_import import import_dataframe, read_dataframe, validate_columns
from app.firma_generator import generar_firma, get_foto_box_size
from app.models import Empleado
from app.schemas import (
    EmpleadoCreate,
    EmpleadoOut,
    EmpleadoUpdate,
    ImportResult,
    PaginatedEmpleados,
)

router = APIRouter(prefix="/api/v1/empleados", tags=["empleados"])

MEDIA_ROOT = Path("media") / "fotos_empleados"


def _center_crop_foto(img: Image.Image) -> Image.Image:
    box_w, box_h = get_foto_box_size()
    return ImageOps.fit(
        img, (box_w, box_h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5)
    )


@router.get("", response_model=PaginatedEmpleados)
def list_empleados(
    search: str | None = Query(None, description="Buscar por nombre, correo, cargo o departamento"),
    departamento: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = select(Empleado)
    if search:
        term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Empleado.nombre_completo.ilike(term),
                Empleado.correo.ilike(term),
                Empleado.cargo.ilike(term),
                Empleado.departamento.ilike(term),
            )
        )
    if departamento:
        query = query.where(Empleado.departamento == departamento)

    total = db.scalar(select(func.count()).select_from(query.subquery()))

    items = db.scalars(
        query.order_by(Empleado.id).offset((page - 1) * page_size).limit(page_size)
    ).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [EmpleadoOut.model_validate(e) for e in items],
    }


@router.get("/departamentos", response_model=list[str])
def list_departamentos(db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Empleado.departamento).distinct().order_by(Empleado.departamento)
    ).all()
    return [r for r in rows if r]


@router.get("/{empleado_id}", response_model=EmpleadoOut)
def get_empleado(empleado_id: int, db: Session = Depends(get_db)):
    empleado = db.get(Empleado, empleado_id)
    if not empleado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado")
    return empleado


@router.post("", response_model=EmpleadoOut, status_code=status.HTTP_201_CREATED)
def create_empleado(payload: EmpleadoCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    if db.scalar(select(Empleado).where(Empleado.correo == data["correo"])):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe un empleado con ese correo")
    empleado = Empleado(**data)
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado


@router.put("/{empleado_id}", response_model=EmpleadoOut)
def update_empleado(empleado_id: int, payload: EmpleadoUpdate, db: Session = Depends(get_db)):
    empleado = db.get(Empleado, empleado_id)
    if not empleado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if "correo" in data and data["correo"]:
        exists = db.scalar(
            select(Empleado).where(Empleado.correo == data["correo"], Empleado.id != empleado_id)
        )
        if exists:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe un empleado con ese correo")

    for field, value in data.items():
        setattr(empleado, field, value)

    db.commit()
    db.refresh(empleado)
    return empleado


@router.delete("/{empleado_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_empleado(empleado_id: int, db: Session = Depends(get_db)):
    empleado = db.get(Empleado, empleado_id)
    if not empleado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado")
    db.delete(empleado)
    db.commit()


@router.post("/importar", response_model=ImportResult)
async def importar_excel(file: UploadFile = File(...)):
    if not (file.filename or "").lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="El archivo debe ser Excel (.xlsx o .xls)")

    try:
        df = read_dataframe(file.file)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"No se pudo leer el archivo: {exc}")

    missing = validate_columns(df)
    if missing:
        raise HTTPException(status_code=400, detail=f"Faltan columnas: {', '.join(missing)}")

    return import_dataframe(df)


@router.post("/{empleado_id}/foto", response_model=EmpleadoOut)
async def subir_foto(empleado_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    empleado = db.get(Empleado, empleado_id)
    if not empleado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado")

    ext = (file.filename or "").lower().rsplit(".", 1)[-1] if "." in (file.filename or "") else ""
    if ext not in {"jpg", "jpeg", "png"}:
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen (.jpg, .jpeg o .png)")

    try:
        data = await file.read()
        img = Image.open(BytesIO(data))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"No se pudo leer la imagen: {exc}")

    img = _center_crop_foto(img)

    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        ext = "png"
        img = img.convert("RGBA")
    else:
        ext = "jpg"
        img = img.convert("RGB")
    dest = MEDIA_ROOT / f"{empleado_id}.{ext}"
    if ext == "png":
        img.save(dest, "PNG")
    else:
        img.save(dest, "JPEG", quality=90)

    empleado.foto_path = str(dest).replace("\\", "/")
    db.commit()
    db.refresh(empleado)
    return empleado


@router.get("/{empleado_id}/firma")
def get_firma(empleado_id: int, db: Session = Depends(get_db)):
    empleado = db.get(Empleado, empleado_id)
    if not empleado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado")

    img = generar_firma(empleado)
    buf = BytesIO()
    img.save(buf, "JPEG", quality=90)
    buf.seek(0)
    return Response(content=buf.getvalue(), media_type="image/jpeg")
