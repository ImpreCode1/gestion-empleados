from datetime import date, datetime

import pandas as pd

from app.database import SessionLocal
from app.models import Empleado

COLUMN_MAP = {
    "Nombre completo": "nombre_completo",
    "Nombre del departamento": "departamento",
    "Nombre del cargo": "cargo",
    "Fecha de contratación": "fecha_contratacion",
    "Género": "genero",
    "Celular": "celular",
    "Cumpleaños": "fecha_nacimiento",
    "Correo electrónico": "correo",
}


def parse_date(value):
    if value is None or pd.isna(value):
        return None
    if isinstance(value, (datetime, pd.Timestamp)):
        return value.date()
    if isinstance(value, date):
        return value
    return pd.to_datetime(value).date()


def parse_celular(value):
    if value is None or pd.isna(value):
        return None
    text = str(value).strip()
    if text.endswith(".0"):
        text = text[:-2]
    if text.lower() == "nan":
        return None
    return text


def read_dataframe(file_path):
    df = pd.read_excel(file_path, dtype={"Celular": str})
    df.columns = [str(col).strip() for col in df.columns]
    return df


def import_dataframe(df):
    db = SessionLocal()
    inserted = 0
    failed = 0
    failures = []

    try:
        for idx, row in df.iterrows():
            try:
                empleado = Empleado(
                    nombre_completo=row["Nombre completo"],
                    departamento=row["Nombre del departamento"],
                    cargo=row["Nombre del cargo"],
                    fecha_contratacion=parse_date(row["Fecha de contratación"]),
                    genero=row["Género"],
                    celular=parse_celular(row["Celular"]),
                    fecha_nacimiento=parse_date(row["Cumpleaños"]),
                    correo=row["Correo electrónico"],
                    hydra_user_id=None,
                )
                db.add(empleado)
                db.commit()
                inserted += 1
            except Exception as exc:  # noqa: BLE001
                db.rollback()
                failed += 1
                failures.append({"fila": idx + 2, "motivo": str(exc)})
    finally:
        db.close()

    return {"total": len(df), "inserted": inserted, "failed": failed, "failures": failures}


def validate_columns(df):
    missing = [col for col in COLUMN_MAP if col not in df.columns]
    return missing
