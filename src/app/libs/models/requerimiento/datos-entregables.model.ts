import { SelectModel } from "../select.model";

export class DatosEntregablesModel {
    constructor(
        public idRequerimiento: number,
        public descEntregable?: string,
        public descPlazoEjecucion?: string,
        public descLugarEjecucion?: string,
        public descConformidadEjecucion?: string,
        public descFormaPago?: string,
    ) { }
}
