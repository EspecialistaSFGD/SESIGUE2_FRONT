import { DataResponses } from "./helpers.interface";

export interface AlcaldesResponses extends DataResponses {
    data: AlcaldeResponse[],
}

export interface AlcaldeResponse {
    alcaldeId?: string,
		dni: string,
		nombre: string,
		cargo: string,
		sexo: string,
    estado: boolean,
    fechaRegistro: Date,
    fechaModificar: Date,
}