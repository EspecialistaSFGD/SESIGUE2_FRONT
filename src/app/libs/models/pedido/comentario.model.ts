import { SelectModel } from "../shared/select.model";

export class ComentarioHitoModel {
    constructor(
        public hitoId?: number,
        public comentario?: string,
        public accesoId?: number,
    ) { }
}


export class ComentarioSDHitoModel {
    constructor(
        public hitoId?: number,
        public comentarioSD?: string,
        public accesoId?: number,
    ) { }
}
