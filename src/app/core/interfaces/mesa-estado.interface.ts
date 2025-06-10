import { DataResponses } from "./helpers.interface"

export interface MesaEstadosResponses extends DataResponses {
  data: MesaEstadoResponse[]
}

export interface MesaEstadoResponse {
    mesaDocumentoId?: string,
    fecha: string,
    resumen: string,
    mesaId: string,
    fechaRegistro?: string
  }