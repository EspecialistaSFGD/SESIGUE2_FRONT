import { DataResponses } from "./helpers.interface"

export interface MesaDetallesResponses extends DataResponses {
  data: MesaDetalleResponse[]
}

export interface MesaDetalleResponse {
    detalleId?: string,
    archivo: string,
    tipoNombre : string,
    tipo : string,
    mesaId: string,
    usuarioId : string,
    responsable? : string,
    fechaRegistro?: string,
  }