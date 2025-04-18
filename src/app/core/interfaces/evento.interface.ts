import { DataResponses } from "./helpers.interface";

export interface EventosResponses extends DataResponses {
	data: EventoResponse[],
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
	estado: string,
	descripcionEstado: string,
	rowNumber?: string,
	fechaFinEvento?: Date,
}