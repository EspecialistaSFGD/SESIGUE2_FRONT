import { PaginationsResponse } from "./pagination.interface"

export interface EspaciosResponses {
  success: boolean,
  message: string,
  errors?: string,
  data: EspacioResponse[],
  info?: PaginationsResponse
}

export interface EspacioResponse {
	espacioId?: string,
  nombre: string
}