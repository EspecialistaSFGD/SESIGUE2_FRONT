import { DataResponses } from "./helpers.interface"
import { MesaIntegranteResponse } from "./mesa-integrantes.interface"

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
  eventoId?: string,
  secretariaTecnicaId: string,
  secretariaTecnica?: string,
  fechaCreacion: string,
  fechaVigencia: string,
  resolucion: string,
  estadoRegistro?: string,
  estadoRegistroNombre?: string,
  sesion?: string,
  am?:string,
  fechaResumen?:string,
  resumen?:string,
  alerta?:string,
  usuarioId: string,
  fechaRegistro?: Date,
  ubigeos?: MesaIntegranteResponse[],
  sectores?: MesaIntegranteResponse[],
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