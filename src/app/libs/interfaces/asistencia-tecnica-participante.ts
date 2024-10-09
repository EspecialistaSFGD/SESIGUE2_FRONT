import { DataResponses } from "./helpers.interface";

export interface AsistenciaTecnicaParticipantesResponses extends DataResponses {
	data: AsistenciaTecnicaParticipanteResponse[],
}

export interface AsistenciaTecnicaParticipanteResponse {
	participanteId?: string,
	cantidad: string,
	asistenciaId: string,
	nivelId: string,
	nombreNivelGobierno?: string,
	estado?: boolean,
	total?: string,
	fechaRegistro?: Date
}