import { DataResponses } from "./helpers.interface";

export interface GruposResponses extends DataResponses {
  data: GrupoResponse[],
}

export interface GrupoResponses extends DataResponses {
  data: GrupoResponse,
}

export interface GrupoResponse {
  grupoID: string,
  abreviatura?: string,
  orden: number,
  nombre: string,
  tipo: number,
  subTipo: number,
  activado?: boolean
}