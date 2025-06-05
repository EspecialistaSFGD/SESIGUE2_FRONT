import { DataResponses } from "./helpers.interface"
import { MesaUbigeoResponse } from "./mesa-ubigeo.interface"

export interface MesasResponses extends DataResponses {
  data: MesaResponse[]
}

export interface MesaResponses extends DataResponses {
  data: MesaResponse
}

export interface MesaResponse {
  mesaId?: string,
  codigo?: string,
  nombre: string,
  abreviatura: string,
  sectorId: string,
  sector?: string,
  secretariaTecnicaId: string,
  secretariaTecnica?: string,
  fechaCreacion: string,
  fechaVigencia: string,
  resolucion: string,
  estadoRegistro?: string,
  estadoRegistroNombre?: string,
  sesion?: string,
  am?:string,
  usuarioId: string,
  fechaRegistro?: Date,
  ubigeos?: MesaUbigeoResponse[],
  sectores?: MesaUbigeoResponse[],
}

export interface MesaFilesResponse {
  id?: string,
  archivo: any,
  nombreArchivo: string,
  usuario: string,
  fecha: string
}

export interface DataModalMesa{
  create: boolean,
  mesa: MesaResponse
}