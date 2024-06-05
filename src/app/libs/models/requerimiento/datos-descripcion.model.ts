import { SelectModel } from "../select.model";

export class DatosDescripcionModel {
    constructor(
        public idRequerimiento: number,
        public descServicio?: string,
        public tieneGarantia?: boolean,
        public descGarantia?: string,
        public descRequisito?: string,
    ) { }
}
