"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { api } from "@/lib/api";
import { Empleado } from "@/lib/types";
import { EmpleadoForm } from "@/components/empleados/EmpleadoForm";

export default function EditarEmpleadoPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Empleado>(`/api/v1/empleados/${id}`)
      .then(setEmpleado)
      .catch((err: any) => setError(err.detail || "Error al cargar empleado"));
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-extrabold mb-6" style={{ color: "#1B2A4A" }}>
        Editar empleado
      </h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {!error && (
        <div className="rounded-2xl bg-white p-6" style={{ border: "1px solid #E2E5EA" }}>
          {empleado ? (
            <EmpleadoForm empleado={empleado} />
          ) : (
            <p className="text-sm text-muted">Cargando...</p>
          )}
        </div>
      )}
    </div>
  );
}
