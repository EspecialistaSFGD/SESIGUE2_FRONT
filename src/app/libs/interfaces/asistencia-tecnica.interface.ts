import { PaginationsResponse } from "./pagination.interface"

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
  GESTION = 'gestion'
}

export interface AsistenciasTecnicasResponses {
  success: boolean,
  message: string,
  errors?: string,
  data: AsistenciaTecnicaResponse[],
  info?: PaginationsResponse
}

export interface AsistenciaTecnicaResponse {
  asistenciaId?: string,
  tipo: string,
  modalidad: string,
  fechaAtencion: string,
  lugarId: string,
  nombreLugar?: string,
  tipoEntidadId: string,
  nombreTipoEntidad?: string,
  entidadId: string,
  nombreEntidad?: string,
  autoridad: boolean,
  dniAutoridad: string,
  nombreAutoridad: string,
  cargoAutoridad: string,
  congresista: boolean,
  dniCongresista: string,
  nombreCongresista: string,
  clasificacion: string,
  espacioId: string,
  nombreEspacio?: string,
  tema: string,
  comentarios: string,
  evidenciaReunion: string,
  evidenciaAsistencia: string,
  code?: string,
  fechaRegistro: Date
}