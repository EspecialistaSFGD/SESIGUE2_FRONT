import { ButtonsActions, UsuarioPermisos } from "@core/interfaces";

export const obtenerPermisosBotones = (botones: UsuarioPermisos[]) => {	
	let permisos: ButtonsActions = {}
	botones.find(action => {     
		switch (action.descripcionBoton) {
			case 'Agregar': permisos.new = true; break;
			case 'Editar': permisos.edit = true; break;
			case 'Eliminar': permisos.delete = true; break;
			case 'Validar': permisos.validate = true; break;
			case 'Reporte': permisos.report = true; break;
			case 'Meta': permisos.goals = true; break;
			case 'Ver': permisos.view = true; break;
			case 'Comentar': permisos.comment = true; break;
			case 'Descargar': permisos.download = true; break;
			case 'Invalidar': permisos.unvalidate = true; break;
			case 'Reactivar': permisos.reactivate = true; break;
		}
	})
	return permisos;
}

export const permisosPCM = (perfilAuth: number) => {
	// const profilePCM = [11,12,23]
    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    return JSON.parse(permisosStorage) ?? false
}