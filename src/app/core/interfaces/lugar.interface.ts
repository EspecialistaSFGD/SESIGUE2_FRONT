import { DataResponses } from "./helpers.interface";

export interface LugaresResponses extends DataResponses {
  data: LugarResponse[]
}

export interface LugarResponse {
  lugarId?: string,
  nombre: string
}