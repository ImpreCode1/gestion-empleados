import Link from "next/link";

const stats = [
  { label: "Total de empleados", value: "435", hint: "registros cargados" },
  { label: "Departamentos", value: "10", hint: "áreas activas" },
  { label: "Importación Excel", value: "100%", hint: "carga automática" },
];

const tools = [
  {
    title: "Empleados",
    desc: "Consulta, crea, edita y elimina empleados con búsqueda instantánea y filtros por departamento.",
    href: "/empleados",
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    ),
  },
  {
    title: "Importar Excel",
    desc: "Sube tu plantilla de empleados en Excel (.xlsx) y carga los registros masivamente de forma segura.",
    href: "/importar",
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div>
      <div className="text-center px-6 pt-12 pb-8">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
          style={{ background: "#FFF8D6", border: "1px solid #F5C400", color: "#9A7800" }}
        >
          ✦ HERRAMIENTA INTERNA RRHH
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={{ color: "#1B2A4A" }}>
          Gestión de{" "}
          <span style={{ color: "#F5C400" }}>Empleados</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto mb-10">
          Administra la base de datos de empleados de Impresistem de forma rápida y segura
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-14">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-5 text-center"
              style={{ background: "#fff", border: "1px solid #E2E5EA" }}
            >
              <p className="text-3xl font-bold" style={{ color: "#1B2A4A" }}>{s.value}</p>
              <p className="text-sm font-medium mt-1" style={{ color: "#1B2A4A" }}>{s.label}</p>
              <p className="text-xs text-muted mt-0.5">{s.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="rounded-2xl p-6 flex flex-col gap-3 transition hover:-translate-y-0.5"
              style={{ background: "#fff", border: "1px solid #E2E5EA", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center h-12 w-12 rounded-xl"
                  style={{ background: "#EBF0FF", color: "#1B2A4A" }}
                >
                  {tool.icon}
                </div>
                <h3 className="text-lg font-bold" style={{ color: "#1B2A4A" }}>{tool.title}</h3>
              </div>
              <p className="text-sm text-muted leading-relaxed">{tool.desc}</p>
              <Link
                href={tool.href}
                className="mt-1 rounded-lg py-2.5 text-sm font-medium text-center transition"
                style={{ background: "#1B2A4A", color: "#fff" }}
              >
                Abrir
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
