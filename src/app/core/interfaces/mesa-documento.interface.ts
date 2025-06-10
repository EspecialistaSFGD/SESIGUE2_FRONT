import { DataResponses } from "./helpers.interface"

export interface MesaDocumentosResponses extends DataResponses {
  data: MesaDocumentoResponse[]
}

export interface MesaDocumentoResponse {
    documentoId?: string,
    archivo: string,
    nombre: string,
    fechaCreacion: string,
    tipoNombre : string,
    tipo : string,
    mesaId: string,
    usuarioId : string,
    responsable? : string,
    fechaRegistro?: string,
  }