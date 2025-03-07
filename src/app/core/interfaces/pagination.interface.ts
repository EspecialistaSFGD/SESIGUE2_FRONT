export interface PaginationResponse {
  pageIndex: number,
  pageSize: number,
  total: number
}

export interface Pagination {
  code?: number,
  columnSort?: string,
  typeSort?: string,
  pageSize?: number,
  currentPage?: number,
  fechaInicio?: string,
  fechaFin?: string,
  tipoPerfil?: string,
  tipo?: string,
  sectorId?: string,
  unidadId?: string,
  tipoEspacioId?: string,
  espacioId?: string,
  tipoEntidadId?: string,
  usuarioId?: string,
  ubigeo?: string,
  total?: number,
  estado?: string
}

export interface PaginationPanel {
  code?: string
  sector?: string,
  tipoEspacio?: string,
  espacio?: string,
  ubigeo?: string
  estado?: string
}