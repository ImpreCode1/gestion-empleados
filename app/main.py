from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.empleados import router as empleados_router

app = FastAPI(title="Gestion de Empleados API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(empleados_router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "Gestion de Empleados - Impresistem S.A.S."}
