import { DataResponses, ItemEnum } from "./helpers.interface"
import { UbigeoDepartmentResponse } from "./ubigeo.interface"

export interface AsistenciasTecnicasResponse extends DataResponses {
  data: AsistenciaTecnicaResponse[],
}

export enum AsistenciasTecnicasTipos {
  ASESORAMIENTO = 'asesoramiento',
  ASISTENCIA = 'asistencia técnica',
  COORDINACION = 'coordinación',
  ATENCION = 'atención',
  DOCUMENTO = 'documento'
}

export enum AsistenciasTecnicasModalidad {
  PRESENCIAL = 'presencial',
  VIRTUAL = 'virtual',
  DOCUMENTO = 'documento'
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
  documentoTitulo?: string,
  numeroExpediente?: string,
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
  eventoId: string,
  unidadId: string,
  orientacionId: string,
  nombreEspacio: string,
  tema: string,
  comentarios: string,
  evidenciaReunion: string,
  evidenciaAsistencia: string,
  estado?: boolean,
  validado?: boolean,
  sector?: string,
  unidad_organica?: string,
  nivel_gobierno?: string,
  nivel_gobierno_slug?: string,
  departamento?: string,
  provincia?: string,
  distrito?: string,
  ubigeo?: string,
  entidad?: string,
  tipo_entidad_slug?: string,
  entidad_slug?: string,
  participa_autoridad?: string,
  evento?: string,
  evento_slug?: string,
  espacio?: string,
  code?: number,
}


export interface AtencionesCargasMasivasResponses extends DataResponses {
  data: AtencionCargaMasivaResponse[],
}

export interface AtencionCargaMasivaResponse {
  id?: string,
	fechaRegistro: Date,
	fechaAtencion: Date,
	numeroExpediente: string,
	documentoTitulo: string,
	nombreAutoridad: string,
	tema: string,
	nombresResponsable: string,
  entidad: string,
	tipoEntidadNombre: string,
	tipoEntidadSlug: string,
	departamento: string,
	provincia: string,
	distrito: string,
	validado: string
}

export interface DataModalAtencion {
  atencion: AsistenciaTecnicaResponse
  clasificaciones: ItemEnum[]
  departamentos: UbigeoDepartmentResponse[]
  modalidades: ItemEnum[]
  orientaciones: ItemEnum[]
  tipos: ItemEnum[]
  authUser: any
}