import { DataResponses } from "./helpers.interface";

export interface FechasResponses extends DataResponses {
  data: FechaResponse[],
}

export interface FechaResponse {
	diaLaborableId?: string,
	fecha: Date,
	dia: string,
	tipo: string,
	fechaRegistro: Date,
}