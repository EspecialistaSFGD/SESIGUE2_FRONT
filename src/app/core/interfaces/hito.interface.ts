import { AcuerdoPanelsResponse } from "./acuerdo.interface";
import { DataResponses } from "./helpers.interface";
import { PanelInfoResponse } from "./panel.interface";

export interface HitosPanelResponses extends DataResponses {
  data: HitosPanelResponse,
}

export interface HitosPanelResponse {
  info: PanelInfoResponse[],
  acuerdos_proceso: PanelInfoResponse[],
  acuerdos_vencidos: PanelInfoResponse[],
  cumplimientos: HitoPanelCumplimientoResponse[]
  sectores:  AcuerdoPanelsResponse[]
}

export interface HitoPanelCumplimientoResponse {
  fecha: Date
  proyectado: string
  cumplidos: number
}

