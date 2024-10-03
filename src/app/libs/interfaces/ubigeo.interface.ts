import { PaginationsResponse } from "./pagination.interface"

export interface UbigeoDepartamentosResponse {
  success: boolean,
  message: string,
  errors?: string,
  data: UbigeoDepartamentoResponse[],
  info?: PaginationsResponse
}
export interface UbigeoDepartamentoResponse {
  departamentoId?: string,
  departamento: string
}