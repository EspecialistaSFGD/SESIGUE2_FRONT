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
  perfilId?: string,
  perfil?: number,
  tipoPerfil?: string,
  tipo?: string,
  tipos?: string[],
  sectorId?: Number,
  sectoresId?: Number[],
  entidadId?:number,
  unidadId?: string,
  tipoEspacioId?: string,
  espacioId?: string,
  documentoNumero?: string,
  tipoEntidadId?: string,
  usuarioId?: string,
  eventoId?: string,
  eventosId?: string[],
  vigentes?: string[],
  estados?: string[],
  tipoEspaciosId?: string[],
  tipoEventosId?: string[],
  nivelGobierno?: string,
  nivelGobiernoId?: string,
  intervencionId?: string,
  intervencionSituacionId?: string,
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
  save?: boolean,
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
  tipoIntervencion?: string,
  tipoEventoId?: string,
  entidadUbigeoId?: string  
  accesoId?: string  
}

export interface PaginationPanel {
  code?: string
  sector?: string,
  tipoEspacio?: string,
  espacio?: string,
  ubigeo?: string
  estado?: string
}