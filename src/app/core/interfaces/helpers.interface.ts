import { kindChart } from "@core/enums";
import { PaginationResponse } from "./pagination.interface";

export interface DataResponses {
  success: boolean,
  message: string,
  errors?: string,
  info?: PaginationResponse,
}
export interface ItemEnum {
  value: string,
  text: string
}

export interface ItemInfo {
  code: string,
  icono: string,
  titulo: string,
  descripcion: string,
  comentario: string
}

export interface CardInfo {
  tipo: string,
  nombre: string,
  descripccion: string
}

export interface ButtonsActions {
  new?: boolean,
  edit?: boolean,
  delete?: boolean,
  view?: boolean,
  upload?: boolean
}

export interface Filters {
  tipoEntidad?: string,
  tipoAtencion?: string,
  departameno?: string,
  provincia?: string,
  distrito?: string,
  ubigeo?: string,
  sector?: string,
  unidadOrganica?: string,
  especialista?: string,
}

export interface ConfigChart {
  kind: kindChart,
  axisX: AxisChart,
  axisY: AxisChart,
  colorLine?: string,
  legend: boolean
}

export interface AxisChart {
  title: string,
  showTitle?: boolean,
  showValue?: boolean,
  axisValue?: string;
}

export interface ThemeProgressBar {
  percent: number,
  theme: string
}

export interface UbigeoConfig {
  tipo: string,
  ubigeo: number,
}