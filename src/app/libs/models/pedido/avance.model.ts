import { SelectModel } from "../shared/select.model";

export class AvanceHitoModel {
    constructor(
        public idAvanceHito?: number,
        public idHito?: number,
        public hito?: SelectModel,
        public fechaEjecucion?: Date,
        public descripcionAvance?: string,
        public idEvidenciaAvance?: string,
        public evidenciaAvance?: File,
        public estadoHito?: SelectModel,
    ) { }
}