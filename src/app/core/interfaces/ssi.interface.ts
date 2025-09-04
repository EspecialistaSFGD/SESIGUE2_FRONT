import { DataResponses } from "./helpers.interface";

export interface SsiInversionResponses extends DataResponses {
  data: SsiInversionResponse
}

export interface SsiInversionResponse {
	unidadOpmi: number,
	sector: string,
	entidad: string,
	funcion: string,
	pimAnioVigente: number,
	devAnioVigente: number,
	devAcumulado: number,
	devAcumuladoAnterior: number,
	nombre: string,
	nivel: string,
	codigoUnidadUei: string,
	unidadUei: string,
	codigounidadUf?: string,
	unidadUf: string,
	devAnioMesVigente: number,
	costoActualizado: number,
	montoConcurrente: number,
	costoControversias: number,
	montoFianza: number,
	costoInversion: number,
	montoViable: number,
	montoProgramadoAnioMesF12: number,
	montoActualizadoAnioMesF12: number
}

export interface SSInversionTooltip {
	loading: boolean,
	visible: boolean,
	nombre: string,
	costoActualizado: number
}
