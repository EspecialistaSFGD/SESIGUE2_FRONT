import { DataResponses } from "./helpers.interface";

export interface TransferenciasFinancierasResponses extends DataResponses {
	data: TransferenciaFinancieraResponse[]
}

export interface TransferenciaFinancieraResponse {
	resolucion: string,
	presidente: string,
	fecha_publicacion: Date,
	codigo_unico: string,
	fuente_financiamiento: string,
	anexos: string,
	fondes: string,
	pliego: string,
	proyecto: string,
	monto: string,
	cod_ubigeo: string,
	departamento: string,
	provincia: string,
	distrito: string,
	tipo_proyecto: string,
	nivel_gobierno: string,
	sub_tipo_proyecto: string,
}

export interface PaginationTransferences {
	periodo?: string,
	tipoProducto?: string,
	tipoUbigeo?: string,
	ubigeo?: string,
	tipoEntidad?: string,
}