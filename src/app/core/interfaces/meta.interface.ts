import { UsuarioResponse } from "./usuario.interface"

export interface MetaToDetails {
	usuarioId: number
}

export interface MetaNew {
	usuarios: UsuarioResponse[]
}