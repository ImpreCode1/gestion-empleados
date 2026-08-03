export interface Empleado {
  id: number;
  nombre_completo: string;
  departamento: string;
  cargo: string;
  fecha_contratacion: string;
  genero: string | null;
  celular: string | null;
  fecha_nacimiento: string;
  correo: string;
  hydra_user_id: string | null;
  created_at: string;
}

export interface PaginatedEmpleados {
  total: number;
  page: number;
  page_size: number;
  items: Empleado[];
}

export interface ImportResult {
  total: number;
  inserted: number;
  failed: number;
  failures: { fila: number; motivo: string }[];
}