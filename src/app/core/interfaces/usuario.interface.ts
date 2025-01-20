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