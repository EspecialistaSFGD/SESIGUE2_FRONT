import { DataResponses } from "./helpers.interface";

export interface AsistenciaTecnicaCongresistasResponses extends DataResponses {
  data: AsistenciaTecnicaCongresistaResponse[],
}

export interface AsistenciaTecnicaCongresistaResponse {
  asistenteCongresistaId?: string,
  asistenciaId: string,
  congresistaId: string,
  nombreCongresista: string,
  estado: boolean,
  fechaRegistro: Date,
  fechaModificar: Date,
}