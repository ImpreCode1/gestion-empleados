"""
Script de importacion de empleados desde un archivo Excel.

Uso:
    python scripts/import_excel.py <ruta_al_archivo.xlsx>

Columnas esperadas en el Excel:
    Nombre completo | Nombre del departamento | Nombre del cargo |
    Fecha de contratacion | Genero | Celular | Cumpleanos | Correo electronico

Ejecutar desde la raiz del proyecto para que el paquete `app` sea importable.
"""
import sys
from datetime import date, datetime
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal  # noqa: E402
from app.models import Empleado  # noqa: E402

load_dotenv()

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
    if text.startswith("nan") or text.lower() == "nan":
        return None
    return text


def main():
    if len(sys.argv) < 2:
        print("Error: falta la ruta del archivo de Excel.")
        print('Uso: python scripts/import_excel.py <ruta_al_archivo.xlsx>')
        sys.exit(1)

    file_path = sys.argv[1]
    if not Path(file_path).exists():
        print(f"Error: no existe el archivo '{file_path}'")
        sys.exit(1)

    df = pd.read_excel(file_path, dtype={"Celular": str})
    df.columns = [str(col).strip() for col in df.columns]

    missing = [col for col in COLUMN_MAP if col not in df.columns]
    if missing:
        print("Error: faltan columnas en el Excel:", ", ".join(missing))
        print("Columnas requeridas:", ", ".join(COLUMN_MAP.keys()))
        sys.exit(1)

    db = SessionLocal()
    inserted = 0
    failed = 0
    failures = []

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
            failures.append((idx + 2, str(exc)))
    else:
        db.close()

    print("\n=== RESULTADO DE IMPORTACION ===")
    print(f"Total de filas en el archivo: {len(df)}")
    print(f"Registros insertados: {inserted}")
    print(f"Registros fallidos: {failed}")
    if failures:
        print("\nDetalle de fallos:")
        for fila, motivo in failures:
            print(f"  - Fila {fila}: {motivo}")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())