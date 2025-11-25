import { DataResponses } from "./helpers.interface";

export interface PerfilesResponses extends DataResponses {
  data: PerfilResponse[]
}

export interface PerfilResponses extends DataResponses {
  data: PerfilResponse
}

export interface PerfilResponse {
  perfilId?: string,
  nombre: string,
  descripcion: string,
  nivelId: string,
  nivel?: string,
  subTipoId: string,
  subTipo?: string,
  subTipoCodigo?: string,
}