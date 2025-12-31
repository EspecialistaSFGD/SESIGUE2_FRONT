import { SelectModel } from "../../models/shared/select.model";

export class TraerReportesInterface {
    constructor(
        public reporteCabeceraId?: number | null,
        public ubigeo?: string | null,
        public sector?: string | null,
        // public espacio?: string | null,
        public tipoEspacioSeleccionado?: string | null,
        public espaciosSeleccionados?: SelectModel[] | null,
        public tipoAcuerdo?: string | null,
    ) { }
}