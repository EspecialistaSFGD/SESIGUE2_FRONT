import { SelectModel } from "./select.model";

export class EspacioModel {
    constructor(
        public eventoId: number,
        public nombre: string,
        public abreviatura: string,
        public descripcionEstado: string,
        public descripcionVigente: string,
        public vigente: any,
        public orden: number,
        public subTipo: string,
        public estado?: number,
        public estadoSelect?: SelectModel,
        public fechaEvento?: Date | null,
        public fechaRegistro?: Date | null,
    ) { }
}

export class EspacioResponseModel {
    constructor(
        public eventoId?: number,
        public nombre?: string,
        public abreviatura?: string,
        public vigente?: number,
        public orden?: number,
        public subTipo?: string,
        public estado?: number,
        public estadoSelect?: SelectModel,
        public descripcionEstado?: string,
        public descripcionVigente?: string,
        public fechaEvento?: Date | null,
        public fechaRegistro?: Date | null,
    ) { }
}

export class TraerEspaciosInterface {
    constructor(
        public estado?: number,
        public pageIndex?: number | null | undefined,
        public pageSize?: number | null | undefined,
        public sortField?: string | null,
        public sortOrder?: string | null,
    ) { }
}