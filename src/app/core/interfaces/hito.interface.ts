import { DataResponses } from "./helpers.interface";
import { PanelInfoResponse } from "./panel.interface";

export interface HitosPanelResponses extends DataResponses {
  data: HitosPanelResponse,
}

export interface HitosPanelResponse {
  info: PanelInfoResponse[],
  estados: PanelInfoResponse[],
  cumplimientos: HitoPanelCumplimientoResponse[]
}

export interface HitoPanelCumplimientoResponse {
  fecha: Date
  estado: string
  cantidad: number
}

