import { SelectModel } from "../shared/select.model";

export class AvanceHitoModel {
    constructor(
        public avanceId?: number,
        public hitdoId?: number,
        public hitoId?: number,
        public fecha?: string,
        public fechaDate?: Date | null,
        public avance?: string,
        public evidencia?: File,
        public idEvidencia?: string,
        public nombreEvidencia?: string,
        public comentarioSD?: null,
        public comentarioSector?: null,
        public comentario?: string,
        public estado?: string,
        public entidadID?: number,
        public entidadId?: number,
        public entidadSelect?: SelectModel | null,
        public validado?: number,
        public accesoId?: number,
    ) { }
}

export class AvanceHitoRequestModel {
    constructor(
        public accesoId?: number | null,
        public avanceId?: number | null,
    ) { }
}