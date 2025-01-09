import { DataResponses } from "./helpers.interface";

export interface EspaciosResponses extends DataResponses {
	data: EspacioResponse[],
}

export interface EspacioResponse {
	espacioId?: string,
	nombre: string
}

export interface EspacioStoreResponse {
	abreviatura: string,
	descripcionEstado: string,
	descripcionVigente: string,
	estado: number,
	eventoId: number,
	fechaEvento: Date,
	fechaFinEvento: Date,
	fechaRegistro: Date
	iCurrentPage: number,
	iPageCount: number,
	iRecordCount: number,
	nombre: string,
	orden: number,
	rowNumber: number,
	subTipo: string,
	vigente: number
}