import { SelectModel } from "../shared/select.model";

export class AvanceHitoModel {
    constructor(
        public avanceId?: number,
        public hitdoId?: number,
        public fecha?: string,
        public avance?: string,
        public evidencia?: string,
        public comentarioSD?: null,
        public comentarioSector?: null,
        public comentario?: string,
        public estado?: number,
        public entidadID?: number,
        public validado?: number,
    ) { }
}
