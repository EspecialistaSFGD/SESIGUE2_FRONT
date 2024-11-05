import { SelectModel } from "../../models/shared/select.model";

export class TraerHitosListadoInterface {
    constructor(
        public cui?: string | null,
        public clasificacionesSeleccionadas?: SelectModel[] | null,
        public tipoSeleccionado?: string | null,
        public estadosSelecionados?: SelectModel[] | null,
        public espaciosSeleccionados?: SelectModel[] | null,
        public sectoresSeleccionados?: SelectModel[] | null,
        public depSeleccionado?: SelectModel | null,
        public provSeleccionada?: SelectModel | null,
        public disSeleccionado?: SelectModel | null,
        public pageIndex?: number | null | undefined,
        public pageSize?: number | null | undefined,
        public sortField?: string | null,
        public sortOrder?: string | null,
    ) { }
}