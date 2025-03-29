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
		}
	})
	return permisos;
}