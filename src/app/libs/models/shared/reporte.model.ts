import { SelectModel } from "./select.model";

export class ReporteAddRequestModel {
    constructor(
        public reporteCabeceraId?: number,
        public fechaInicio?: Date,
        public fechaFin?: Date,
        public eventoId?: number,
        public sectorId?: number,
        public ubigeo?: string,
        public entidadId?: number,
        public estadoAcuerdo?: number,
    ) { }
}

export class ReporteFormModel {
    constructor(
        public reporteCabeceraId?: number,
        public fechaInicioFin?: Date,
        public espacioSelect?: SelectModel,
        public sectorSelect?: SelectModel,
        public departamentoSelect?: SelectModel,
        public provinciaSelect?: SelectModel,
        public entidadSelect?: SelectModel,
        public estadoAcuerdoSelect?: SelectModel,
    ) { }
}

export class ReporteRequestModel {
    constructor(
        public reporteCabeceraId?: number,
        public ubigeo?: string,
        public espacio?: string,
        public sector?: string,
        public tipo?: string,
    ) { }
}

export interface ReporteCorteModel {
    reporteCabeceraId: number;
    descripcionReporte: string;
    estado: number;
    filtro: string;
    fechaRegistro: Date;
}

export class TraerReportesCorteInterface {
    constructor(
        public pageIndex?: number | null | undefined,
        public pageSize?: number | null | undefined,
        public sortField?: string | null,
        public sortOrder?: string | null,
    ) { }
}

export class ReporteSectorModel {
    constructor(
        public sector?: string,
        public porcentaje?: number,
        public ejecutados?: number,
        public acuerdos?: number,
    ) { }
}

export class ReporteTotalModel {
    constructor(
        public total?: number,
        public desestimado?: number,
        public vigente?: number,
        public cumplido?: number,
        public proceso?: number,
        public vencido?: number,
        public pendiente?: number,
        public porcentaje?: number,
    ) { }
}
