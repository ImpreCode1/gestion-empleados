"use client";

import { useRef, useState } from "react";

import { api, BASE_URL } from "@/lib/api";
import { Empleado } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface FirmaManagerProps {
  empleado: Empleado;
}

export function FirmaManager({ empleado }: FirmaManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [fotoPath, setFotoPath] = useState<string | null>(empleado.foto_path);
  const [firmaUrl, setFirmaUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const firmaEndpoint = `${BASE_URL}/api/v1/empleados/${empleado.id}/firma`;

  const abrir = async () => {
    setIsOpen(true);
    try {
      const blob = await api.download(`/api/v1/empleados/${empleado.id}/firma`);
      setFirmaUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      addToast(err.detail || "Error al generar la firma", "error");
    }
  };

  const cerrar = () => {
    setIsOpen(false);
    if (firmaUrl) URL.revokeObjectURL(firmaUrl);
    setFirmaUrl(null);
  };

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const actualizado = await api.upload<Empleado>(`/api/v1/empleados/${empleado.id}/foto`, formData);
      setFotoPath(actualizado.foto_path);
      addToast("Foto subida correctamente", "success");
      const blob = await api.download(`/api/v1/empleados/${empleado.id}/firma`);
      setFirmaUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      addToast(err.detail || "Error al subir la foto", "error");
    } finally {
      setSubiendo(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <button
        onClick={abrir}
        className="text-xs font-semibold px-2.5 py-1 rounded transition"
        style={{ background: "#E9EAF0", color: "#1B2A4A" }}
      >
        Firma
      </button>

      <Modal isOpen={isOpen} onClose={cerrar} title={`Firma - ${empleado.nombre_completo}`}>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Foto (recorta automáticamente)</h3>
            <div className="flex items-center gap-3">
              {fotoPath ? (
                <img
                  src={`${BASE_URL}/${fotoPath}`}
                  alt="Foto"
                  className="w-16 h-16 rounded-lg object-cover"
                  style={{ border: "1px solid #E2E5EA" }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-xs text-gray-400"
                  style={{ border: "1px dashed #E2E5EA" }}
                >
                  Sin foto
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={subirFoto} className="text-sm" disabled={subiendo} />
            </div>
            {subiendo && <p className="text-xs text-muted mt-2">Subiendo foto...</p>}
          </div>

          <div className="border-t pt-3" style={{ borderColor: "#E2E5EA" }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Vista previa de la firma</h3>
              <a href={firmaUrl || firmaEndpoint} download={`firma_${empleado.id}.jpg`}>
                <Button variant="accent">Descargar JPG</Button>
              </a>
            </div>
            {firmaUrl ? (
              <img src={firmaUrl} alt="Firma" className="w-full rounded-lg" style={{ border: "1px solid #E2E5EA" }} />
            ) : (
              <p className="text-sm text-muted py-6 text-center">Generando firma...</p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}