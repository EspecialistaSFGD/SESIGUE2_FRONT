import { DataResponses } from "./helpers.interface";

export interface TransferenciasFinancierasResponses extends DataResponses {
	data: TransferenciaFinancieraResponse[]
}

export interface TransferenciaFinancieraResponse {
	// resolucion: string,
	// presidente: string,
	// fecha_publicacion: Date,
	// codigo_unico: string,
	// fuente_financiamiento: string,
	// anexos: string,
	// fondes: string,
	// pliego: string,
	// proyecto: string,
	// monto: string,
	// cod_ubigeo: string,
	// departamento: string,
	// provincia: string,
	// distrito: string,
	// tipo_proyecto: string,
	// nivel_gobierno: string,
	// sub_tipo_proyecto: string,
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

export interface PaginationTransferences {
	periodo?: string,
	tipoProducto?: string,
	tipoUbigeo?: string,
	ubigeo?: string,
	tipoEntidad?: string,
	cui?: string,
	dispositivo?: string
}