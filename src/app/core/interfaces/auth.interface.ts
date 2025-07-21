import { DataResponses } from "./helpers.interface";

export interface GenerarClaveResponses extends DataResponses {
	data: GenerarClaveResponse,
}

export interface GenerarClaveResponse {
	email?: string;
	usuario?: string;
	codigo?: string;
}