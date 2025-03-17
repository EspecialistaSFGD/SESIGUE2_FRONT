import { DataResponses } from "./helpers.interface";

export interface TransferenciasFinancierasResponses extends DataResponses {
	data: TransferenciaFinancieraResponse[]
}

export interface TransferenciasFinancierasResolucionResponses extends DataResponses {
	data: TransferenciaFinancieraResolucionResponse[]
}

export interface TransferenciaFinancieraResolucionResponse {
	resolucion: string
}

export interface TransferenciaFinancieraResponse {
	tipo: string,
	codigo_snip: string,
	codigo_unico: string,
	sub_tipo: string,
	tipo_1: string,
	nombre_proyecto: string,
	sector: string,
	funcion: string,
	nivel_gobierno: string,
	ue_codigo_ubigeo: string,
	ue_departamento: string,
	ue_provincia: string,
	ue_distrito: string,
	pliego_matriz: string,
	transferencia: string,
	anio: string,
	periodo: string,
	resolucion: string,
	fecha_publicacion: Date,
	anexos: string,
	fondes: string,
	fuente_financiamiento: string,
}


export interface TransferenciasFinancierasResumenResponses extends DataResponses {
	data: TransferenciaFinancieraResumenResponse[]
}

export interface TransferenciaFinancieraResumenResponse {
	tipo: string,
	codigo_unico: string,
	sector: string,
	funcion: string,
	nivel: string,
	ue_departamento: string,
	ue_provincia: string,
	ue_distrito: string,
	pliego: string,
	ley: string,
	transferencia: string,
	periodo: string,
	nombre_proyecto: string,
	costoActualizado: string,
	devAcumulado: string,
	pim: string,
	pia: string,
	dev: string,
	compromiso: string,
	certificado: string,
}




export interface PaginationTransferences {
	periodo?: string,
	tipoProducto?: string,
	tipoUbigeo?: string,
	ubigeo?: string,
	tipoEntidad?: string,
	cui?: string,
	dispositivo?: string
}