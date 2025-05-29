import { DataResponses } from "./helpers.interface"

export interface MesaUbigeosResponses extends DataResponses {
  data: MesaUbigeoResponse[]
}

export interface MesaUbigeoResponse {
    mesaUbigeoId?: string,
    mesaId: string,
    ubigeo?: string,
    entidad? : string,
    entidadId: string,
    departamento?: string,
    provincia?: string,
    distrito?: string,
    autoridad?: boolean,
    alcaldesistenteId: string,
    esSector: boolean,
    fechaRegistro?: string,
  }