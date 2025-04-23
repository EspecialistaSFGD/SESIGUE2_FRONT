import { DataResponses } from "./helpers.interface";

export interface DescargarResponses extends DataResponses {
  data: DescargarResponse,
}

export interface DescargarResponse {
  binario: string;
  nombre: string;
  tipo: string;
}