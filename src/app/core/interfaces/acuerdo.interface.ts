import { DataResponses } from "./helpers.interface";
import { PanelInfoResponse } from "./panel.interface";

export interface AcuerdosPanelResponses extends DataResponses {
  data: AcuerdosPanelResponse,
}
export interface AcuerdosPanelResponse {
  info: PanelInfoResponse[],
  ubigeo: AcuerdoPanelsResponse[],
  sectores: AcuerdoPanelsResponse[],
}

export interface AcuerdoPanelsResponse {
  nombre: string,
  pendientes: number,
  cumplidos: number,
  en_proceso: number,
  desestimados: number,
  porcentaje?: number,
  vigentes: number,
  total: number,
}


export interface AcuerdoPanelTotales {
  vigentes: number,
  cumplidos: number,
  total?: number
}

export interface AcuerdoDesestimacionResponse {
  acuerdoId?: number,
  comentario: string,
  usuarioId: number
}

export interface AcuerdoDesestimacionResponses extends DataResponses{
  data: number,
}

export interface AcuerdosResponses extends DataResponses {
  data: AcuerdoResponse[],
}

export interface AcuerdoResponse {
  // acuerdoId?: string,
  // estadoRegistroNombre: string,
  // codigo: string,
  // acuerdo: string,
  // cuis: string,
  // clasificacion: string
  acuerdoID?: string,
  codigo: string,
  acuerdo: string,
  plazo: string,
  fechaCumplimiento: string,
  motivoDesestimacion: string,
  evidenciaDesestimacion: string,
  fechaPedidoDesestimacion: string,
  preAcuerdo: string,
  nivelReporte: string,
  estadoRegistro: string,
  estadoRegistroInterno: string,
  tipoId: string,
  tipo: string,
  prioridadID: string,
  objetivoEstrategicoTerritorial: string,
  intervencionesEstrategicas: string,
  aspectoCriticoResolver: string,
  cuis: string,
  clasificacionID: string,
  clasificacion: string,
  responsableID: string,
  responsable: string,
  subTipoId: string,
  subTipoCodigo: string,
  subTipo: string,
  eventoId: string,
  evento: string,
  sectorId: string,
  sector: string,
  entidadId: string,
  entidad: string,
  ubigeo: string,
  departamento: string,
  provincia: string,
  distrito: string,
  prioridadTerritorial: string,
}