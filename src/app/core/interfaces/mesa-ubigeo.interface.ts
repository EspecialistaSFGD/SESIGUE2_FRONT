import { DataResponses } from "./helpers.interface"

export interface MesaUbigeosResponses extends DataResponses {
  data: MesaUbigeoResponse[]
}

export interface MesaUbigeoResponse {
    mesaUbigeoId?: string,
    mesaId: string,
    entidad? : string,
    entidadId: string,
    departamento?: string,
    provincia?: string,
    distrito?: string,
    autoridad?: boolean,
    alcaldeAsistenteId: string,
    esSector: boolean,
    sector?: boolean,
    ubigeo?: boolean,
    dni?: boolean,
    nombres?: boolean,
    apellidos?: boolean,
    telefono?: boolean,
    fechaRegistro?: string,
  }