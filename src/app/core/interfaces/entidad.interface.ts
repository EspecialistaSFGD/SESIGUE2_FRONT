import { DataResponses } from "./helpers.interface";

export interface EntidadesResponses extends DataResponses {
  data: EntidadResponse[],
}

export interface EntidadResponse {
  entidadId?: string,
  departamento: string,
  provincia: string,
  distrito: string,
  ubigeo: string,
  entidad: string,
  dniAlcalde: String,
  nombreAlcalde: String,
  cargoAlcalde: String,
  sexoAlcalde: String,
}