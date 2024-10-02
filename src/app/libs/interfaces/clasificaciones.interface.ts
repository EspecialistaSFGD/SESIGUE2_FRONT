import { PaginationsResponse } from "./pagination.interface"

export interface ClasificacionesResponses {
  success: boolean,
  message: string,
  errors?: string,
  data: ClasificacionResponse[],
  info?: PaginationsResponse
}

export interface ClasificacionResponse {
  clasificacionId?: string,
  nombre: string
}