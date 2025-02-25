import { DataResponses } from "./helpers.interface";

export interface AcuerdosPanelResponses extends DataResponses {
  data: AcuerdosPanelResponse,
}
export interface AcuerdosPanelResponse {
  info: AcuerdoPanelInfoResponse[],
  ubigeo: AcuerdoPanelsResponse[],
  sectores: AcuerdoPanelsResponse[],
}
export interface AcuerdoPanelInfoResponse {
  acuerdoID?: string,
  condicion: string,
  cantidad: number
}

export interface AcuerdoPanelsResponse {
  nombre: string,
  pendientes: number,
  cumplidos: number,
  en_proceso: number,
  desestimados: number,
  porcentaje: number,
  vigentes: number,
  total: number,
}


export interface AcuerdoPanelTotales {
  vigentes: number,
  cumplidos: number
}