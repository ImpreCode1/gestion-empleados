"use client";

import { EmpleadoForm } from "@/components/empleados/EmpleadoForm";

export default function NuevoEmpleadoPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-extrabold mb-6" style={{ color: "#1B2A4A" }}>
        Nuevo empleado
      </h1>
      <div className="rounded-2xl bg-white p-6" style={{ border: "1px solid #E2E5EA" }}>
        <EmpleadoForm />
      </div>
    </div>
  );
}
