import { ButtonsActions, UsuarioPermisos } from "@core/interfaces";

export const obtenerPermisosBotones = (botones: UsuarioPermisos[]) => {
	console.log(botones);
	
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

export const permisosPCM = (perfilAuth: number) => {
	const profilePCM = [11,12,23]
    return profilePCM.includes(perfilAuth)
}