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
  codigo?: string,
  fechaInicio?: string,
  fechaFin?: string,
  perfil?: number,
  tipoPerfil?: string,
  tipo?: string,
  sectorId?: number,
  entidadId?:number,
  unidadId?: string,
  tipoEspacioId?: string,
  espacioId?: string,
  documentoNumero?: string,
  tipoEntidadId?: string,
  usuarioId?: string,
  eventoId?: string,
  total?: number,
  estado?: string,
  dispositivo?: string,
  periodo?: string,
  tipoProducto?: string,
  tipoUbigeo?: string,
  ubigeo?: string,
  cui?: string,
  tipoEntidad?: string,
  intervencionId?: string
  faseId?: string,
  etapaId?: string
}

export interface PaginationPanel {
  code?: string
  sector?: string,
  tipoEspacio?: string,
  espacio?: string,
  ubigeo?: string
  estado?: string
}