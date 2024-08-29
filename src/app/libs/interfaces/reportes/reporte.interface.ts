export class TraerReportesInterface {
    constructor(
        public reporteCabeceraId?: number | null,
        public ubigeo?: string | null,
        public sector?: string | null,
        public espacio?: string | null,
        public tipoAcuerdo?: string | null,
    ) { }
}