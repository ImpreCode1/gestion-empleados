"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { api, formatFecha } from "@/lib/api";
import { Empleado, PaginatedEmpleados } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

const PAGE_SIZE = 15;

export default function EmpleadosPage() {
  const [items, setItems] = useState<Empleado[]>([]);
  const [total, setTotal] = useState(0);
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [departamento, setDepartamento] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  const loadDepartamentos = useCallback(async () => {
    try {
      const data = await api.get<string[]>("/api/v1/empleados/departamentos");
      setDepartamentos(data);
    } catch {
      // catálogos opcionales
    }
  }, []);

  const load = useCallback(
    async (term: string, dept: string, currentPage: number) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("page_size", String(PAGE_SIZE));
        if (term.trim()) params.set("search", term.trim());
        if (dept !== "all") params.set("departamento", dept);
        const data = await api.get<PaginatedEmpleados>(`/api/v1/empleados?${params}`);
        setItems(data.items);
        setTotal(data.total);
      } catch (err: any) {
        setError(err.detail || "Error al cargar empleados");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => { loadDepartamentos(); }, [loadDepartamentos]);
  useEffect(() => { load(search, departamento, page); }, [search, departamento, page, load]);

  const handleDelete = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/api/v1/empleados/${id}`);
      addToast("Empleado eliminado", "success");
      load(search, departamento, page);
    } catch (err: any) {
      addToast(err.detail || "Error al eliminar", "error");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: "#1B2A4A" }}>Empleados</h1>
          <p className="text-sm text-muted mt-1">{total} registros en total</p>
        </div>
        <div className="flex gap-2">
          <Link href="/importar">
            <Button variant="accent">Importar Excel</Button>
          </Link>
          <Link href="/empleados/nuevo">
            <Button>Nuevo empleado</Button>
          </Link>
        </div>
      </div>

      <div className="relative mb-4">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nombre, correo, cargo o departamento..."
          className="w-full rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition"
          style={{ background: "#fff", border: "1.5px solid #E2E5EA", color: "#1B2A4A" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#1B2A4A")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E5EA")}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => { setDepartamento("all"); setPage(1); }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
            departamento === "all"
              ? "text-white border-transparent"
              : "bg-white border-border text-muted hover:text-primary hover:border-accent"
          }`}
          style={departamento === "all" ? { background: "#1B2A4A", borderColor: "#1B2A4A" } : undefined}
        >
          Todos
        </button>
        {departamentos.map((d) => (
          <button
            key={d}
            onClick={() => { setDepartamento(d); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              departamento === d
                ? "text-white border-transparent"
                : "bg-white border-border text-muted hover:text-primary hover:border-accent"
            }`}
            style={departamento === d ? { background: "#1B2A4A", borderColor: "#1B2A4A" } : undefined}
          >
            {d}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #E2E5EA" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <Table
            columns={[
              { key: "nombre_completo", header: "Nombre" },
              { key: "departamento", header: "Departamento" },
              { key: "cargo", header: "Cargo" },
              {
                key: "fecha_contratacion",
                header: "Contratación",
                render: (row: Empleado) => formatFecha(row.fecha_contratacion),
              },
              {
                key: "genero",
                header: "Género",
                render: (row: Empleado) =>
                  row.genero ? (
                    <Badge text={row.genero === "F" ? "Femenino" : row.genero === "M" ? "Masculino" : row.genero} variant="default" />
                  ) : (
                    "-"
                  ),
              },
              { key: "celular", header: "Celular" },
              { key: "correo", header: "Correo" },
              {
                key: "acciones",
                header: "Acciones",
                render: (row: Empleado) => (
                  <div className="flex gap-2">
                    <Link
                      href={`/empleados/${row.id}/editar`}
                      className="text-xs font-semibold px-2.5 py-1 rounded transition"
                      style={{ background: "#EBF0FF", color: "#1B2A4A" }}
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(row.id, row.nombre_completo)}
                      className="text-xs font-semibold px-2.5 py-1 rounded transition"
                      style={{ background: "#FEE2E2", color: "#B91C1C" }}
                    >
                      Eliminar
                    </button>
                  </div>
                ),
              },
            ]}
            data={items}
            keyExtractor={(row: Empleado) => row.id}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-5">
        <p className="text-sm text-muted">
          Página {page} de {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
