import { DataResponses } from "./helpers.interface";

export interface CargasMasivasResponses extends DataResponses {
	data: CargaMasivaResponse[],
}

export interface CargaMasivaUploadResponse {
	code: number,
	tabla: string,
	archivo: string,
}

export interface CargaMasivaResponseDetail extends DataResponses {
	data: CargaMasivaResponse,
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