import { DataResponses } from "./helpers.interface";

export interface UsuarioMetasResponses extends DataResponses {
	data: UsuarioMetaResponse[],
}

export interface UsuarioMetaResponse {
	codigoUsuario: string
	nombresPersona: string
	fecha: string
	meta: string,
	atenciones?: string
}

export interface MetaUsuariosResponses extends DataResponses {
	data: MetaUsuarioResponse[],
}


export interface MetaUsuarioResponse {
	metaId?: string,
	usuarioId: string,
	fecha: string,
	meta: string,
	atenciones?: string
}