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

export interface HitoResponses extends DataResponses {
  data: HitoResponse,
}

export interface HitoResponse {
  hitoId?: number,
  acuerdoId: number,
  codigo?: string,
  hito: string,
  responsableId: number,
  responsable?: string,
  plazo: string,
  comentarioSd?: string,
  estadoRegistro?: number,
  entidadId: number,
  entidad?: string,
  validado: boolean,
  fechaValidacion?: string,
  nomContacto?: string,
  telefContacto?: string,
  accesoId: number,
  estado: number,
  nomEstadoRegistro?: string,
  nomEstado?: string,
}

