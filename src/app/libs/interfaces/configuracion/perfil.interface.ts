export class TraerPerfilesInterface {
    constructor(
        public nombrePerfilSeleccionado?: string | null,
        public pageIndex?: number | null | undefined,
        public pageSize?: number | null | undefined,
        public sortField?: string | null,
        public sortOrder?: string | null,
    ) { }
}