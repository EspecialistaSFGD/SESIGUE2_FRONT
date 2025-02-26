import { DataResponses } from "./helpers.interface";

export interface HitosPanelResponses extends DataResponses {
  data: HitosPanelResponse,
}
export interface HitosPanelResponse {
  info: HitoPanelInfoResponse[],
  estados: HitoPanelInfoResponse[],
  cumplimientos: HitoPanelCumplimientoResponse[]
}

export interface HitoPanelInfoResponse {
  acuerdoID?: string,
  condicion: string,
  cantidad: number
}

export interface HitoPanelCumplimientoResponse {
  fecha: Date
  estado: string
  cantidad: number
}

