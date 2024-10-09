import { DataResponses } from "./helpers.interface";

export interface AsistenciaTecnicaAgendasResponses extends DataResponses {
	data: AsistenciaTecnicaAgendaResponse[],
}

export interface AsistenciaTecnicaAgendaResponse {
	agendaId?: string,
	cui: string,
	asistenciaId: string,
	clasificacionId: string,
	nombreClasificacion?: string,
	estado?: boolean,
	total?: string,
	fechaRegistro?: Date
}