import { PaginationResponse } from "./pagination.interface"

export interface AsistenciasTecnicasResponse {
  success: boolean,
  message: string,
  errors?: string,
  data: AsistenciaTecnicaResponse[],
  info?: PaginationResponse
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
  GESTION = 'gestión'
}

export interface AsistenciaTecnicaResponse {
  asistenciaId?: string,
  tipo: string,
  modalidad: string,
  fechaAtencion: Date,
  lugarId: string,
  nombreLugar: string,
  tipoEntidadId: string,
  nombreTipoEntidad: string,
  entidadId: string,
  nombreEntidad: string,
  autoridad: boolean,
  dniAutoridad: string,
  nombreAutoridad: string,
  cargoAutoridad: string,
  congresista: boolean,
  dniCongresista: string,
  nombreCongresista: string,
  clasificacion: string,
  espacioId: string,
  nombreEspacio: string,
  tema: string,
  comentarios: string,
  evidenciaReunion: string,
  evidenciaAsistencia: string,
  estado: boolean,
  fechaRegistro: Date
  code: number,
}