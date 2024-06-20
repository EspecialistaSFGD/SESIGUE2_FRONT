import { SelectModel } from "../../models/shared/select.model";

export class TraerPedidosInterface {
    constructor(
        public espaciosSeleccionados?: SelectModel[] | null,
        public sectoresSeleccionados?: SelectModel[] | null,
        public depSeleccionado?: SelectModel | null,
        public provSeleccionada?: SelectModel | null,
        public pageIndex?: number | null | undefined,
        public pageSize?: number | null | undefined,
        public sortField?: string | null,
        public sortOrder?: string | null,
    ) { }
}
