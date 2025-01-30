// export interface SectorResponse {
//   value: number,
//   label: string
// }

import { DataResponses } from "./helpers.interface";

export interface SectoresResponses extends DataResponses {
    data: SectorResponse[],
}


export interface SectorResponse {
  grupoID: string,
  nombreCompleto: string,
  orden: number,
  nombre: string,
}