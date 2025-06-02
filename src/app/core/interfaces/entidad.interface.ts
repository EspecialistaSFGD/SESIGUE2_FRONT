import { DataResponses } from "./helpers.interface";

export interface EntidadesResponses extends DataResponses {
  data: EntidadResponse[],
}

export interface EntidadResponses extends DataResponses {
  data: EntidadResponse,
}

export interface EntidadResponse {
  entidadId?: string,
  nombre: string,
  departamento: string,
  provincia: string,
  distrito: string,
  ubigeo: string,
  ubigeo_oficial: string,
  entidad: string,
  entidadTipo?: string,
  entidadSlug?: string,
}

export interface ParamsEntidad {
  entidadId?: string,
  ubigeo?: string,
}