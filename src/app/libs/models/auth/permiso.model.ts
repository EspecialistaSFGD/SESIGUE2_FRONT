export class PermisoModel {
    constructor(
        public puede_agregar_hito: boolean = false,
        public puede_editar_hito: boolean = false,
        public puede_eliminar_hito: boolean = false,
        public puede_validar_hito: boolean = false,
        public puede_desestimar_hito: boolean = false,
        public puede_comentar_hito: boolean = false,
        public puede_agregar_avance: boolean = false,
        public puede_editar_avance: boolean = false,
        public puede_eliminar_avance: boolean = false,
        public puede_validar_avance: boolean = false,
        public puede_desestimar_avance: boolean = false,
        public puede_comentar_avance: boolean = false,
    ) { }
}
