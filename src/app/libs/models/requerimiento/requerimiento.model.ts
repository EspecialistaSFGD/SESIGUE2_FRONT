import { SelectModel } from "../select.model";

export class RequerimientoModel {
    constructor(
        public idRequerimiento: string,
        public tipoRequerimiento: SelectModel,
        public estRequerimiento: SelectModel,
        public nomRequerimiento: string,
        public fecRegistro: Date,
        public flgConsultoria?: boolean,
        public idTipoRequerimiento?: number,
        public idEstRequerimiento?: number,
        public idTipoConsultoria?: number,
        public tipoConsultoria?: SelectModel,
        public fecBusqueda?: Date[],
    ) { }
}
