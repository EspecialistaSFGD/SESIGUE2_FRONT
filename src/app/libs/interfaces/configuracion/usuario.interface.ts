import { SelectModel } from "../../models/shared/select.model";

export class TraerUsuariosInterface {
    constructor(
        public nombreUsuarioSeleccionado?: string | null,
        public nombreTrabajadorSeleccionado?: string | null,
        public perfilSeleccionado?: SelectModel | null,
        public pageIndex?: number | null | undefined,
        public pageSize?: number | null | undefined,
        public sortField?: string | null,
        public sortOrder?: string | null,
    ) { }
}