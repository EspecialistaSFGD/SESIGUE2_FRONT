export interface GeoObjectModel {
    ubigeo: string;
    id: string;
    totalAcuerdo: number;
    totalEjecutado: number;
    porcentaje: number;
    porcentajeStr: string;
}

export interface ReporteMensualModel {
    periodo: string;
    cantidad: number;
    tipo: string;
    porcentaje: number;
    acuerdos: number;
    ejecutados: number;
    avance: string;
    color: string;
}

