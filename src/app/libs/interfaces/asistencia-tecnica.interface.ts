import { PaginationsResponse } from "./pagination.interface"

export interface AsistenciasTecnicasResponse {
  success: boolean,
  message: string,
  errors?: string,
  data: AsistenciaTecnicaResponse[],
  info?: PaginationsResponse
}

export enum AsistenciasTecnicasTipos {
  ASESORAMIENTO = 'asesoramiento',
  ASISTENCIA = 'asistencia técnica',
  COORDINACION = 'coordinación'
}

export enum AsistenciasTecnicasModalidad {
  PRESENCIAL = 'presencial',
  VIRTUAL = 'virtual'
}

export enum AsistenciasTecnicasClasificacion {
  PRESENCIAL = 'inversión',
  VIRTUAL = 'gestion'
}

export interface AsistenciaTecnicaResponse {
  asistenciaId?: string,
  tipo: string,
  fechaAtencion: Date,
  lugarId: string,
  tipoEntidadId: string,
  entidadId: string,
  autoridad: string,
  dniAutoridad: string,
  nombreAutoridad: string,
  cargoAutoridad: string,
  congresista: string,
  dniCongresista: string,
  nombreCongresista: string,
  espacioId: string,
  tema: string,
  comentarios: string,
  evidenciaReunion: string,
  evidenciaAsistencia: string
}