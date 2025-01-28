import { PaginatedModel } from "./paginated.model";
import { SeguridadModel } from "./seguridad.model";

export class MenuModel extends SeguridadModel {
    constructor(
        public codigoMenu: number,
        public descripcionItem: string,
        public direccionUrl: string,
        public paramsUrl: string,
        public parentMenu: number,
        public codigoMenuPadre: number,
        public iconoMenu?: string,
        public ordenMenu?: number,
        public iconoItem?: string,
        public ordenItem?: number,
        public esExterno?: boolean,
        public botones?: any[],
        public children?: MenuModel[],
    ) {
        super();
    }
}

export class TraerMenuesInterface extends PaginatedModel {
    constructor(
        public codigoMenu: number,
    ) {
        super(1, 10, 'codigoMenu', 'descend');
    }
}

export class TraerBotonesInterface extends PaginatedModel {
    constructor(
        public codigoBoton: number | null,
    ) {
        super(1, 10, 'codigoBoton', 'descend');
    }
}

export class TraerAccesosInterface extends PaginatedModel {
    constructor(
        public codigoAcceso: number | null,
    ) {
        super(1, 10, 'codigoAcceso', 'descend');
    }
}