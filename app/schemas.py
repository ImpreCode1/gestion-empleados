from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmpleadoBase(BaseModel):
    nombre_completo: str = Field(..., min_length=1, max_length=255)
    departamento: str = Field(..., min_length=1, max_length=150)
    cargo: str = Field(..., min_length=1, max_length=150)
    fecha_contratacion: date
    genero: str | None = Field(None, max_length=1)
    celular: str | None = Field(None, max_length=20)
    fecha_nacimiento: date
    correo: EmailStr
    hydra_user_id: str | None = Field(None, max_length=255)


class EmpleadoCreate(EmpleadoBase):
    pass


class EmpleadoUpdate(BaseModel):
    nombre_completo: str | None = Field(None, min_length=1, max_length=255)
    departamento: str | None = Field(None, min_length=1, max_length=150)
    cargo: str | None = Field(None, min_length=1, max_length=150)
    fecha_contratacion: date | None = None
    genero: str | None = Field(None, max_length=1)
    celular: str | None = Field(None, max_length=20)
    fecha_nacimiento: date | None = None
    correo: EmailStr | None = None
    hydra_user_id: str | None = Field(None, max_length=255)


class EmpleadoOut(EmpleadoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    foto_path: str | None = None
    created_at: datetime


class PaginatedEmpleados(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[EmpleadoOut]


class ImportResult(BaseModel):
    total: int
    inserted: int
    failed: int
    failures: list[dict]
