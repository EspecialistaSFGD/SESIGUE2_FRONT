import { DataResponses } from "./helpers.interface"

export interface AsistenciasTecnicasResponse extends DataResponses {
  data: AsistenciaTecnicaResponse[],
}

export enum AsistenciasTecnicasTipos {
  ASESORAMIENTO = 'asesoramiento',
  ASISTENCIA = 'asistencia técnica',
  COORDINACION = 'coordinación',
  ATENCION = 'atención'
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
  tipoPerfil: string,
  tipo: string,
  modalidad: string,
  fechaAtencion: Date,
  sectorId: string,
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
  contactoAutoridad: string,
  congresista: boolean,
  dniCongresista: string,
  nombreCongresista: string,
  clasificacion: string,
  espacioId: string,
  unidadId: string,
  orientacionId: string,
  nombreEspacio: string,
  tema: string,
  comentarios: string,
  evidenciaReunion: string,
  evidenciaAsistencia: string,
  estado?: boolean,
  // fechaRegistro?: Date
  code?: number,
}