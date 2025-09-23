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
  piCurrentPage?: number,
  piPageSize?: number,
  codigo?: string,
  fechaInicio?: string,
  fechaFin?: string,
  perfil?: number,
  tipoPerfil?: string,
  tipo?: string,
  sectorId?: Number,
  entidadId?:number,
  unidadId?: string,
  tipoEspacioId?: string,
  espacioId?: string,
  documentoNumero?: string,
  tipoEntidadId?: string,
  usuarioId?: string,
  eventoId?: string,
  nivelGobiernoId?: string,
  total?: number,
  estado?: string,
  dispositivo?: string,
  periodo?: string,
  tipoProducto?: string,
  tipoUbigeo?: string,
  ubigeo?: string,
  nivelUbigeo?:string,
  cui?: string,
  tipoEntidad?: string,
  codigoUnico?: string,
  intervencionEspacioId?: string,
  intervencionTareaId?: string,
  faseId?: string,
  etapaId?: string
  alcaldeId?: string,
  asistenteId?: string,
  dni?: string,
  nombres?: string,
  apellidos?: string,
  telefono?: string,
  sexo?: string,
  nombre?: string,
  esSector?: string
  origenId?: string,
  recursoId?: string,
  interaccionId?: string,
  tipoEventoId?: string,
  entidadUbigeoId?: string  
}

export interface PaginationPanel {
  code?: string
  sector?: string,
  tipoEspacio?: string,
  espacio?: string,
  ubigeo?: string
  estado?: string
}