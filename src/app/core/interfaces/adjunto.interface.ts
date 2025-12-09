import { DataResponses } from "./helpers.interface"

export interface AdjuntosResponses extends DataResponses {
  data: AdjuntoResponse[]
}

export interface AdjuntoResponses extends DataResponses {
  data: AdjuntoResponse
}

export interface AdjuntoResponse {
  adjuntoId?: string,
  nombreTabla: string,
  tablaId: string,
  archivo: string,
  usuarioId: string
}