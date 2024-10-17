import { DataResponses } from "./helpers.interface";

export interface CongresistasResponses extends DataResponses {
    data: CongresistaResponse[],
}

export interface CongresistaResponse {
    congresistaId: string,
    congresista: boolean,
    dni: string,
    nombre: string,
    descripcion: string,
    estado: boolean,
    fechaRegistro: Date,
    fechaModificar: Date,
}