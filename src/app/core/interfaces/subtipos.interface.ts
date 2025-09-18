import { DataResponses } from "./helpers.interface";

export interface SubTiposResponses extends DataResponses {
    data: SubTipoResponse [],
}

export interface SubTipoResponse {
  codigoSubTipo?: string,
  codigoNivel: string,
  codigo: string,
  descripcionSubTipo: string,
  esActivo: boolean,
  codigoUsuario: string,
  codigoModifica: string,
  fechaRegistro: string,
  fechaModifica: string,
}