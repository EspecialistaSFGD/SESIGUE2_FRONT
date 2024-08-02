import { ComentarioType } from "../../shared/types/comentario.type";
import { SeguridadModel } from "../shared/seguridad.model";

export class ComentarioModel extends SeguridadModel {
    constructor(
        public id?: number | null,
        public tipo?: ComentarioType,
        public tipoComentario?: number | null,
        public comentario?: string,
    ) {
        super();
    }
}

export class ComentarioHitoModel {
    constructor(
        public hitoId?: number,
        public comentario?: string,
        public accesoId?: number,
    ) { }
}

export class ComentarioAvanceModel extends SeguridadModel {
    constructor(
        public avanceId?: number | null,
        public tipoComentario?: number | null,
        public comentario?: string,
    ) {
        super();
    }
}


export class ComentarioSDHitoModel {
    constructor(
        public hitoId?: number,
        public comentarioSD?: string,
        public accesoId?: number,
    ) { }
}
