import { SelectModel } from "../select.model";

export class HitoAcuerdoModel {
    constructor(
        public idHito?: number,
        public hito?: string,
        public idAcuerdo?: number,
        public acuerdo?: SelectModel,
        public idEntidadResponsable?: number,
        public entidadResponsable?: SelectModel,
        public plazo?: Date,
        //TODO: validar si es necesario
        public estado?: SelectModel,
    ) { }
}