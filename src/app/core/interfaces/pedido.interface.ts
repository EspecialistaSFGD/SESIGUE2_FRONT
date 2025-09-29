import { DataResponses } from "./helpers.interface";

export interface PedidosResponses extends DataResponses {
  data: PedidoResponse[],
}

export interface PedidoResponse {
    prioridadID?: string,
    codigo: string,
    objetivoEstrategicoTerritorial: string,
    intervencionesEstrategicas: string,
    aspectoCriticoResolver: string,
    cuis: string,
    tipoIntervencionId: string,
    ejeEstrategicoId: string,
    comentarioPcm: string,
    tipoInversionId: string,
    cantidadPreAcuerdos: string,
    cantidadAcuerdos: string,
    tipoEventoId: string,
    tipoEvento: string,
    subTipoId: string,
    subTipo: string,
    subTipoCodigo: string,
    eventoId: string,
    evento: string,
    estadoEvento: string,
    fechaEvento: string,
    fechaFinEvento: string,
    sectorId: string,
    sector: string,
    ubigeo: string,
    entidadId: string,
    departamento: string,
    provincia: string,
    distrito: string,
    validado: number,
}