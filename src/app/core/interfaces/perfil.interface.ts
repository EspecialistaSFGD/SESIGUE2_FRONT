import { DataResponses } from "./helpers.interface";

export interface PerfilesResponses extends DataResponses {
  data: PerfilResponse[]
}

export interface PerfilResponse {
  codigoPerfil: string,
  descripcionPerfil: string,
  codigoNivel: string,
  codigoSubTipo: string
}