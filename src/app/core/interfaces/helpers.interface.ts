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
  upload?: boolean,
  download?: boolean,
  report?: boolean
  validate?: boolean
  goals?:boolean
  approve?:boolean
  comment?: boolean
  unvalidate?: boolean
  reactivate?: boolean
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
  legend: boolean,
  height: number,
  rowsLineChart?: RowlineChart[],
}

export interface RowlineChart {
  title: string,
  serie: string,
  color: string,
  label: LabelChart
}

export interface LabelChart {
  show: boolean,
  dx: number,
  dy: number,
}

export interface AxisChart {
  title: string,
  serie: string,
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

export interface ExportResponses extends DataResponses {
  data: FileResponse,
}

export interface FileResponse {
  archivo: any,
  nombreArchivo: string,
  contentType?: string
}

export interface ColorEstados {
	color: string,
	icono: string
}


export interface SocialMedia {
  name: string,
  icon: string,
  url: string
}

export interface DataFile {
  exist: boolean,
  file?: File
}