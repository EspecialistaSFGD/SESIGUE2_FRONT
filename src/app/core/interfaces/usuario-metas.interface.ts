import { DataResponses } from "./helpers.interface";

export interface UsuarioMetasResponses extends DataResponses {
	data: UsuarioMetaResponse[],
}

export interface UsuarioMetaResponse {
	codigoUsuario: string
	nombresPersona: string
	fecha: string
	meta: string
}