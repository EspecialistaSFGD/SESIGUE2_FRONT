import { SelectModel } from "../shared/select.model";

export class HitoAcuerdoModel {
    constructor(
        public hito?: string,
        public responsable?: string,
        public plazo?: string,
        public comentarioSD?: string,
        public estado?: number,
        public estadoRegistro?: number,
        public hitoId?: number,
        public acuerdoID?: number,
        public responsableID?: number,
        public nomEstado?: string,
        public entidadId?: number,
        public validado?: number,
        public fechaValidacion?: string,
        public nomContacto?: string,
        public telefContacto?: string,
    ) { }
}
