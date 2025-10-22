import { DataResponses } from "./helpers.interface";

export interface AsistentesResponses extends DataResponses {
	data: AsistenteResponse[],
}

export interface AsistenteResponses extends DataResponses {
	data: AsistenteResponse,
}

export interface AsistenteResponse {
	asistenteId?: string,
	dni: string,
	nombres: string,
	apellidos?: string,
	telefono?: string,
	sexo?: string,
	email?: string,
}