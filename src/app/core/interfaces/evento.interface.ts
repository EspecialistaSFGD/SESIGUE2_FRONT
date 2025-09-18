import { DataResponses } from "./helpers.interface";

export interface EventosResponses extends DataResponses {
	data: EventoResponse[],
}

export interface EventoResponses extends DataResponses {
	data: EventoResponse,
}

export interface EventoResponse {
	eventoId?: string,
	nombre: string,
	fechaEvento?: string,
	abreviatura: string,
	fechaRegistro: Date,
	vigente: string,
	descripcionVigente?: string,
	orden?: string,
	subTipo: string,
	subTipoId: string,
	estado: string,
	descripcionEstado: string,
	rowNumber?: string,
	verificaAsistentes: boolean,
	fechaFinEvento?: Date,
	codigoTipoEvento?: string,
	tipoEvento?: string,
}

export interface DataModalEvento{
  create: boolean,
  evento: EventoResponse
}