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
  distritoMef: string,
  ubigeo: string,
  ubigeo_oficial: string,
  ubigeo_jne: string,
  entidad: string,
  entidadTipo?: string,
  subTipo?: string,
  entidadSlug?: string,
  entidadTipoSlug?: string,
  partidoPolitico: string,
  nivelGobierno?: string,
  autoridadId?: string,
  asistenteId?: string,
  dnAutoridad?: string,
  nombreAutoridad?: string,
  apellidosAutoridad?: string,
  cargoAutoridad?: string,
  sexoAutoridad?: string,
}


export interface EntidadesPanelResponses extends DataResponses {
  data: EntidadesPanelResponse,
}

export interface EntidadesPanelResponse {
  ubigeos: EntidadPanelResponseUbigeo[],
  mesas: EntidadPanelResponse[],
  eventos: EntidadPanelResponse[],
}

export interface EntidadPanelResponse {
  id?: string,
  nombre?: string,
  numero?: number,
  porcentaje?: number,
}

export interface EntidadPanelResponseUbigeo extends EntidadPanelResponse {
  ubigeo?: string
}