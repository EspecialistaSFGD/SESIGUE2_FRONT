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
    ubigeo?: string,
    entidadId?: string,
    telefono?: string,
    departamento?: string,
    provincia?: string,
    distrito?: string,
    entidad?: string,
    entidadTipoSlug?: string,
    estado: boolean,
    fechaRegistro: Date,
    fechaModificar: Date,
}