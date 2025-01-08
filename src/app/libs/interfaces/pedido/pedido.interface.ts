import { PaginatedModel } from "../../models/shared/paginated.model";
import { SelectModel } from "../../models/shared/select.model";

export class TraerPedidosInterface {
    constructor(
        public cui?: string | null,
        public tipoEspacioSeleccionado?: SelectModel | null,
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

export class TraerAcuerdosInterface {
    constructor(
        public cui?: string | null,
        public clasificacionesSeleccionadas?: SelectModel[] | null,
        public tipoEspacioSeleccionado?: SelectModel | null,
        public tipoSeleccionado?: SelectModel | null,
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

export class TraerAcuerdosPorPedidoInterface extends PaginatedModel {
    constructor(
        public prioridadID?: number | null,
    ) {
        super(1, 10, 'acuerdoID', 'descend');
    }
}

export class TraerHitosInterface {
    constructor(
        public acuerdoID?: number | null,
        public hitoID?: number | null,
        public pageIndex?: number | null | undefined,
        public pageSize?: number | null | undefined,
        public sortField?: string | null,
        public sortOrder?: string | null,
    ) { }
}
export class TraerAvancesInterface {
    constructor(
        public hitoId?: number | null,
        public pageIndex?: number | null | undefined,
        public pageSize?: number | null | undefined,
        public sortField?: string | null,
        public sortOrder?: string | null,
    ) { }
}
