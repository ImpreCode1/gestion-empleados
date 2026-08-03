import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Gestión de Empleados - Impresistem S.A.S.",
  description: "Sistema de Gestión de Empleados",
};

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/empleados", label: "Empleados" },
  { href: "/importar", label: "Importar Excel" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ToastProvider>
        <header
          style={{ background: "#1B2A4A", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
        >
          <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center h-7 w-7 rounded-md font-bold text-sm"
                  style={{ background: "#F5C400", color: "#1B2A4A" }}
                >
                  GE
                </div>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>|</span>
                <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>
                  Gestión de Empleados
                </span>
              </div>
            </div>
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-md text-sm transition"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}