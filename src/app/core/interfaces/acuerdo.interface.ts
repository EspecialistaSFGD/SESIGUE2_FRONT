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