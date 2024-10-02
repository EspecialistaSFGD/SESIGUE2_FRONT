import { PaginationsResponse } from "./pagination.interface"

export interface NivelesGobiernosResponses {
  success: boolean,
  message: string,
  errors?: string,
  data: NivelGobiernoResponse[],
  info?: PaginationsResponse
}

export interface NivelGobiernoResponse {
  nivelId?: string,
  nombre: string
}