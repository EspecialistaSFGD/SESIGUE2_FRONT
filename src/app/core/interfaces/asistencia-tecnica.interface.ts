import { EventoResponse } from "./evento.interface"
import { DataResponses, ItemEnum } from "./helpers.interface"
import { UbigeoDepartmentResponse } from "./ubigeo.interface"

export interface AsistenciasTecnicasResponse extends DataResponses {
  data: AsistenciaTecnicaResponse[],
}

export interface AsistenciaTecnicaResponses extends DataResponses {
  data: AsistenciaTecnicaResponse,
}

export enum AsistenciasTecnicasTipos {
  ASESORAMIENTO = 'asesoramiento',
  ASISTENCIA = 'asistencia técnica',
  COORDINACION = 'coordinación',
  CAPACITACION = 'capacitación',
  ATENCION = 'atención',
  VISITA = 'visita',
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
  lugar?: string,
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
  partidoPolitico?: string,
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
  acuerdos: string,
  evidenciaReunion: string,
  evidenciaAsistencia: string,
  estado?: boolean,
  validado?: boolean,
  sector?: string,
  responsable?: string,
  unidadOrganica?: string,
  tipoEntidad?: string,
  tipoEntidadSlug?: string,
  departamento?: string,
  provincia?: string,
  distrito?: string,
  ubigeo?: string,
  entidad?: string,
  entidadTipo?: string,
  entidadSlug?: string,
  participaAutoridad?: string,
  eventoId: string,
  evento?: string,
  eventoSlug?: string,
  espacio?: string,
  code?: number,
}


export interface AtencionesCargasMasivasResponses extends DataResponses {
  data: AtencionCargaMasivaResponse[],
}

export interface AtencionCargaMasivaResponse {
  id?: string,
	codigo: string,
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

export interface OrientacionAtencion {
  orientacionId: number
  nombre: string,
}

export interface AsistentesAtencionResponse{
  data: AsistenteAtencionResponse,
}

export interface AsistenteAtencionResponse {
  asistenciaId: number,
  asistenteId: number,
  entidadId: number,
  entidad: string,
  entidadTipo: string,
  subTipo: string,
  ubigeo: string,
  dni: string,
  nombres: string,
  cargo: string,
  telefono: string,
  email: string,
}

export interface DataModalAtencion {
  atencion: AsistenciaTecnicaResponse
  clasificaciones: ItemEnum[]
  departamentos: UbigeoDepartmentResponse[]
  modalidades: ItemEnum[]
  orientaciones: OrientacionAtencion[]
  tipos: ItemEnum[]
  evento: EventoResponse
  authUser: any
  create: boolean
}