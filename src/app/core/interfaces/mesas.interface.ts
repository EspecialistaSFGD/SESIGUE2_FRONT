import { DataResponses } from "./helpers.interface"

export interface MesasResponses extends DataResponses {
  data: MesaResponse[]
}

export interface MesaResponses extends DataResponses {
  data: MesaResponse
}

export interface MesaResponse {
  mesaId?: string,
  codigo: string,
  nombre: string,
  estadoInternoNombre: string,
  estadoInterno: string,
  sesion?: string,
  am?:string,
  fechaRegistro: Date,
}

export interface MesaFilesResponse {
  id?: string,
  archivo: any,
  nombreArchivo: string,
  usuario: string,
  fecha: string
}