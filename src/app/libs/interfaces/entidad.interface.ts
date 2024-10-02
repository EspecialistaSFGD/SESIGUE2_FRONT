import { PaginationsResponse } from "./pagination.interface"

export interface TipoEntidadesResponses {
  success: boolean,
  message: string,
  errors?: string,
  data: TipoEntidadResponse[],
  info?: PaginationsResponse
}

export interface TipoEntidadResponse {
	tipoId?: string,
  nombre: string
}