from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.excel_import import import_dataframe, read_dataframe, validate_columns
from app.models import Empleado
from app.schemas import (
    EmpleadoCreate,
    EmpleadoOut,
    EmpleadoUpdate,
    ImportResult,
    PaginatedEmpleados,
)

router = APIRouter(prefix="/api/v1/empleados", tags=["empleados"])


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
