from sqlalchemy import Column, Date, DateTime, Integer, String, func

from app.database import Base


class Empleado(Base):
    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre_completo = Column(String(255), nullable=False)
    departamento = Column(String(150), nullable=False)
    cargo = Column(String(150), nullable=False)
    fecha_contratacion = Column(Date, nullable=False)
    genero = Column(String(1), nullable=True)
    celular = Column(String(20), nullable=True)
    fecha_nacimiento = Column(Date, nullable=False)
    correo = Column(String(255), unique=True, nullable=False)
    hydra_user_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
