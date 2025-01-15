import { DataResponses } from "./helpers.interface"

export interface AsistenciasTecnicasResponse extends DataResponses {
  data: AsistenciaTecnicaResponse[],
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
  codigo?: string,
  tipo: string,
  modalidad: string,
  fechaAtencion: Date,
  lugarId: string,
  nombreLugar: string,
  tipoEntidadId: string,
  nombreTipoEntidad: string,
  entidadId: string,
  ubigeoEntidad: string,
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
  estado?: boolean,
  // fechaRegistro?: Date
  code?: number
}