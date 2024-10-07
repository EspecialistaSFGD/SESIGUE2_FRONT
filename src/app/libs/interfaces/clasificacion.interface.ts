import { PaginationResponse } from "./pagination.interface";

export interface ClasificacionesResponses {
  success: string,
  message: string,
  errors?: string,
  data: ClasificacionResponse[],
  info?: PaginationResponse,
}

export interface ClasificacionResponse {
  clasificacionId?: string,
  nombre: string
}