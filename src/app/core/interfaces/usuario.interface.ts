import { DataResponses } from "./helpers.interface";

export interface UsuariosResponses extends DataResponses {
	data: UsuarioResponse[],
}

export interface UsuarioNavigation {
	codigoMenu?: string,
	descripcionItem: string,
	direccionUrl: string,
	parentMenu: number,
	iconoMenu: string,
	ordenMenu?: number,
	esExterno: boolean,
	botones?: UsuarioPermisos[],
}

export interface UsuarioPermisos {
	codigoBoton?: string,
	descripcionBoton: string,
	iconoBoton: string,
	ordenBoton?: number,
	tagBoton?: string,
}

export interface UsuarioResponse {
	codigoUsuario?: string,
	nombresPersona: string,
	apellidoPaterno: string,
	apellidoMaterno: string,
	tipoDocumento: string,
	numeroDocumento: string,
	telefono: string,
	correoNotificacion: string,
	perfil: string,
	codigoPerfil: string,
	esActivo: string,
	tipo: string,
	sector: string,
	entidad: string,
	departamento: string,
	provincia: string,
	distrito: string,
	entidadNombre: string,
	sectorNombre: string,
}