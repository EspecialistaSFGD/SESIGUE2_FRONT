import { DataResponses } from "./helpers.interface"

export interface MesaIntegrantesResponses extends DataResponses {
  data: MesaIntegranteResponse[]
}

export interface MesaIntegranteResponse {
    mesaUbigeoId?: string,
    mesaId: string,
    entidadId: string,
    entidad? : string,
    entidadTipo? : string,
    entidadSlug? : string,
    departamento?: string,
    provincia?: string,
    distrito?: string,
    autoridad?: boolean,
    alcaldeAsistenteId: string,
    esSector: boolean,
    sectorId?: string,
    sector?: boolean,
    ubigeo?: string,
    dni?: string,
    nombres?: string,
    apellidos?: string,
    telefono?: string,
    fechaRegistro?: string,
  }

  export interface DataModalMesaIntegrante {
    create: boolean,
    integrante: MesaIntegranteResponse
  }