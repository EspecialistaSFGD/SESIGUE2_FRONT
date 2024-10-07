import { PaginationResponse } from "./pagination.interface";

export interface LugaresResponses {
  success: string,
  message: string,
  errors?: string,
  data: LugarResponse[],
  info?: PaginationResponse,
}

export interface LugarResponse {
  lugarId?: string,
  nombre: string
}