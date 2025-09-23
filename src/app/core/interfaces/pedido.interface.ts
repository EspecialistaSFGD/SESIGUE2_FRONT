import { DataResponses } from "./helpers.interface";

export interface PedidosResponses extends DataResponses {
  data: PedidoResponse[],
}

export interface PedidoResponse {
    prioridadID?: string,
    espacio: string,
    sector: string,
    ubigeo: string,
    region: string,
    provincia: string,
    distrito: string,
    objetivoEstrategicoTerritorial: string,
    intervencionesEstrategicas: string,
    aspectoCriticoResolver: string,
    validado: string,
    cuis: string,
    cantidadPreAcuerdos: string,
    cantidadAcuerdos: string,
    eventoId: string,
    sectorid: string,
    depaid: string,
    provid: string,
    RowNumber: string,
    tipoIntervencionId: string,
    ejeEstrategicoId: string,
    comentarioPCM: string,
    estadoEspacio: string,
    descripcionEstadoEspacio: string,
    fechaEvento: string,
    fechaFinEvento: string,
    codigo: string,
    bloquearRegistro: string,
    tipoInversionId: string,
}