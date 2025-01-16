import { DataResponses } from "./helpers.interface";

export interface ClasificacionesResponses extends DataResponses {
  data: ClasificacionResponse[],
}

export interface ClasificacionResponse {
  clasificacionId?: string,
  nombre: string,
  estado: boolean
}