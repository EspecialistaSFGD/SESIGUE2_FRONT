import { DataResponses } from "./helpers.interface";

export interface TipoEventosResponses extends DataResponses {
  data: TipoEventoResponse[]
}

export interface TipoEventoResponse {
  codigoTipoEvento: string,
  descripcionTipoEvento: string,
}