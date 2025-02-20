import { DataResponses } from "./helpers.interface";

export interface AcuerdosPanelResponses extends DataResponses {
		data: AcuerdosPanelResponse,
}
export interface AcuerdosPanelResponse {
	info: AcuerdoPanelInfoResponse[],
	departamentos: AcuerdoPanelDepartamentoResponse[],
}
export interface AcuerdoPanelInfoResponse {
	acuerdoID?: string,
	condicion: string,
	cantidad: number
}

export interface AcuerdoPanelDepartamentoResponse {
	departamento: string,
	pendientes: number,
	cumplidos: number,
	en_proceso: number,
	desestimados: number,
	porcentaje: number,
	total: number,
}