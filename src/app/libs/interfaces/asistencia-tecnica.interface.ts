import { PaginationsResponse } from "./pagination.interface"

export interface AsistenciasTecnicasResponses {
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
  VIRTUALS = 'virtual'
}

export enum AsistenciasTecnicasClasificacion {
  INVERSION = 'inversión',
  GECTION = 'gestion'
}

export interface AsistenciaTecnicaResponse {
  asistenciaId?: string,
  tipo: string,
  modalidad: string,
  fechaAtencion: string,
  lugarId: string,
  tipoEntidadId: string,
  entidadId: string,
  autoridad: boolean,
  dniAutoridad: string,
  nombreAutoridad: string,
  cargoAutoridad: string,
  congresista: boolean,
  dniCongresista: string,
  nombreCongresista: string,
  clasificacion: string,
  espacioId: string,
  tema: string,
  comentarios: string,
  evidenciaReunion: string,
  evidenciaAsistencia: string
  code?: string
}