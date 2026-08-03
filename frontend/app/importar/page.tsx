"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { api } from "@/lib/api";
import { ImportResult } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const COLUMNAS = [
  "Nombre completo",
  "Nombre del departamento",
  "Nombre del cargo",
  "Fecha de contratación",
  "Género",
  "Celular",
  "Cumpleaños",
  "Correo electrónico",
];

export default function ImportarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".xlsx") && !f.name.toLowerCase().endsWith(".xls")) {
      addToast("El archivo debe ser .xlsx o .xls", "error");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await api.upload<ImportResult>("/api/v1/empleados/importar", formData);
      setResult(data);
      addToast(`${data.inserted} empleados importados`, data.failed > 0 ? "info" : "success");
    } catch (err: any) {
      addToast(err.detail || "Error al importar", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-extrabold mb-1" style={{ color: "#1B2A4A" }}>
        Importar Excel
      </h1>
      <p className="text-sm text-muted mb-6">
        Carga masivamente empleados desde una plantilla Excel. Los registros se insertan con{" "}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">hydra_user_id</code> vacío.
      </p>

      <div
        className="rounded-2xl p-10 text-center cursor-pointer transition"
        style={{
          border: dragging ? "1.5px dashed #F5C400" : "1.5px dashed #C9CDD3",
          background: dragging ? "rgba(245,196,0,0.06)" : "#fff",
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <svg className="mx-auto mb-4" width="44" height="44" fill="none" stroke="#F5C400" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        {file ? (
          <>
            <p className="font-semibold text-sm" style={{ color: "#1B2A4A" }}>{file.name}</p>
            <p className="text-xs text-muted mt-1">Haz clic para cambiar de archivo</p>
          </>
        ) : (
          <>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Arrastra tu archivo aquí o <strong style={{ color: "#F5C400" }}>selecciona uno</strong>
            </p>
            <p className="text-xs text-muted mt-1">Solo .xlsx o .xls</p>
          </>
        )}
      </div>

      <div className="mt-6">
        <Button variant="accent" className="w-full" disabled={!file} loading={loading} onClick={handleImport}>
          Importar empleados
        </Button>
      </div>

      {result && (
        <div
          className="mt-6 rounded-2xl p-5"
          style={{
            background: result.failed > 0 ? "rgba(245,196,0,0.08)" : "rgba(34,197,94,0.08)",
            border: `1px solid ${result.failed > 0 ? "#F5C400" : "#22C55E"}`,
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: "#1B2A4A" }}>
            Resultado de la importación
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center mb-3">
            <div>
              <p className="text-xl font-bold" style={{ color: "#1B2A4A" }}>{result.total}</p>
              <p className="text-xs text-muted">Total</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{result.inserted}</p>
              <p className="text-xs text-muted">Insertados</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${result.failed > 0 ? "text-red-600" : "text-green-600"}`}>
                {result.failed}
              </p>
              <p className="text-xs text-muted">Fallidos</p>
            </div>
          </div>
          {result.failures.length > 0 && (
            <div className="rounded-lg bg-white p-3 max-h-48 overflow-auto" style={{ border: "1px solid #E2E5EA" }}>
              {result.failures.map((f, i) => (
                <p key={i} className="text-xs text-red-700 mb-1">
                  Fila {f.fila}: {f.motivo}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-6" style={{ border: "1px solid #E2E5EA" }}>
        <h3 className="font-semibold mb-3" style={{ color: "#1B2A4A" }}>Columnas requeridas</h3>
        <div className="flex flex-wrap gap-2">
          {COLUMNAS.map((c) => (
            <span
              key={c}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "#EBF0FF", color: "#1B2A4A" }}
            >
              {c}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted mt-4">
          El mapeo es: <strong>Cumpleaños → fecha_nacimiento</strong>, <strong>Fecha de contratación → fecha_contratacion</strong>.
          El celular se guarda como texto para conservar ceros iniciales.
        </p>
      </div>

      <div className="mt-6">
        <Link href="/empleados">
          <Button variant="secondary">Volver a empleados</Button>
        </Link>
      </div>
    </div>
  );
}
