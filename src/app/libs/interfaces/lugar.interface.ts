import { PaginationsResponse } from "./pagination.interface"

export interface LugaresResponses {
  success: boolean,
  message: string,
  errors?: string,
  data: LugarResponse[],
  info?: PaginationsResponse
}

export interface LugarResponse {
  lugarId?: string,
  nombre: string
}