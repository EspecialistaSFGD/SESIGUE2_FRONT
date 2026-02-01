import { DataResponses } from "./helpers.interface";

export interface ParametrosResponses extends DataResponses {
    data: ParametroResponse[],
}

export interface ParametroResponses extends DataResponses {
    data: ParametroResponse,
}

export interface ParametroResponse {
    parametroId?: string,
    nombre: string,
    valorTexto: string,
    valorEntero: number,
    descripcion: string,
    tipo: string,
}