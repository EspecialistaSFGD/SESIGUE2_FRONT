import { SelectModel } from "../select.model";

export class DatosGeneralesModel {
    constructor(
        public idRequerimiento?: number,
        public tienePresupesto?: boolean,
        public incluidoCuadroMultianual?: boolean,
        public idTipoContratacion?: number,
        public tipoContratacion?: SelectModel,
        public esConsultoria?: boolean,
        public idTipoConsultoria?: number,
        public tipoConsultoria?: SelectModel,
        public idCuadroMultianual?: number,
        public cuadroMultianual?: SelectModel,
        public denominacionServicio?: string,
        public objetivoServicio?: string,
        public finalidadPublica?: string,
    ) { }
}
