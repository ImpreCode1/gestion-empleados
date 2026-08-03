"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { api } from "@/lib/api";
import { Empleado } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface FormProps {
  empleado?: Empleado | null;
}

interface FormState {
  nombre_completo: string;
  departamento: string;
  cargo: string;
  fecha_contratacion: string;
  genero: string;
  celular: string;
  fecha_nacimiento: string;
  correo: string;
}

const empty: FormState = {
  nombre_completo: "",
  departamento: "",
  cargo: "",
  fecha_contratacion: "",
  genero: "",
  celular: "",
  fecha_nacimiento: "",
  correo: "",
};

function toInputDate(iso?: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#1B2A4A" }}>
        {label} {required && <span style={{ color: "#B91C1C" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition bg-white";
const inputStyle = { borderColor: "#E2E5EA", color: "#1B2A4A" };

export function EmpleadoForm({ empleado }: FormProps) {
  const router = useRouter();
  const isEdit = Boolean(empleado);
  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (empleado) {
      setForm({
        nombre_completo: empleado.nombre_completo,
        departamento: empleado.departamento,
        cargo: empleado.cargo,
        fecha_contratacion: toInputDate(empleado.fecha_contratacion),
        genero: empleado.genero ?? "",
        celular: empleado.celular ?? "",
        fecha_nacimiento: toInputDate(empleado.fecha_nacimiento),
        correo: empleado.correo,
      });
    }
  }, [empleado]);

  if (isEdit && !empleado) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-sm text-muted">Cargando...</div>
      </div>
    );
  }

  const set = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      nombre_completo: form.nombre_completo,
      departamento: form.departamento,
      cargo: form.cargo,
      fecha_contratacion: form.fecha_contratacion || null,
      genero: form.genero || null,
      celular: form.celular || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      correo: form.correo,
    };

    try {
      if (empleado) {
        await api.put(`/api/v1/empleados/${empleado.id}`, payload);
      } else {
        await api.post("/api/v1/empleados", payload);
      }
      router.push("/empleados");
      router.refresh();
    } catch (err: any) {
      setError(err.detail || "Error al guardar");
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nombre completo" required>
            <input
              className={inputClass} style={inputStyle} required
              value={form.nombre_completo}
              onChange={(e) => set("nombre_completo", e.target.value)}
            />
          </Field>
          <Field label="Correo electrónico" required>
            <input
              className={inputClass} style={inputStyle} type="email" required
              value={form.correo}
              onChange={(e) => set("correo", e.target.value)}
            />
          </Field>
          <Field label="Departamento" required>
            <input
              className={inputClass} style={inputStyle} required
              value={form.departamento}
              onChange={(e) => set("departamento", e.target.value)}
            />
          </Field>
          <Field label="Cargo" required>
            <input
              className={inputClass} style={inputStyle} required
              value={form.cargo}
              onChange={(e) => set("cargo", e.target.value)}
            />
          </Field>
          <Field label="Fecha de contratación" required>
            <input
              className={inputClass} style={inputStyle} type="date" required
              value={form.fecha_contratacion}
              onChange={(e) => set("fecha_contratacion", e.target.value)}
            />
          </Field>
          <Field label="Fecha de nacimiento" required>
            <input
              className={inputClass} style={inputStyle} type="date" required
              value={form.fecha_nacimiento}
              onChange={(e) => set("fecha_nacimiento", e.target.value)}
            />
          </Field>
          <Field label="Género">
            <select
              className={inputClass} style={inputStyle}
              value={form.genero}
              onChange={(e) => set("genero", e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </Field>
          <Field label="Celular">
            <input
              className={inputClass} style={inputStyle}
              value={form.celular}
              placeholder="Ej: 3001234567"
              onChange={(e) => set("celular", e.target.value)}
            />
          </Field>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            {empleado ? "Guardar cambios" : "Crear empleado"}
          </Button>
          <Link href="/empleados">
            <Button type="button" variant="secondary">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}