import { DataResponses } from "./helpers.interface";

export interface CargasMasivasResponses extends DataResponses {
	data: CargaMasivaResponse[],
}

export interface CargaMasivaSaveResponse {
	code: number,
	tabla: string,
	archivo: string,
}

export interface CargaMasivaResponse {
	id?: string,
	estado: string,
	nombreArchivo: string,
	directorioArchivo: string,
	nombreTabla: string,
	totalFilas: number,
	filasGuardadas: number
	fechaRegistro: Date,
}

export interface CargaMasivaDetailResponse {
	id?: string,
	fechaRegistro: Date,
	fechaAtencion: Date,
	numeroExpediente: string,
	documentoTitulo: string,
	nombreAutoridad: string,
	tema: string,
	nombresResponsable: string,
	tipoEntidadNombre: string,
	tipoEntidadSlug: string,
	departamento: string,
	provincia: string,
	distrito: string,
	validado: string
}