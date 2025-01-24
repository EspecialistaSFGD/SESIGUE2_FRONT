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
	filasGuardadas: number,
	total: number,
	fechaRegistro: Date,
}