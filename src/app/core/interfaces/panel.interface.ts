import { ItemEnum } from "./helpers.interface";

export interface PanelInfoResponse {
  acuerdoID?: string,
  condicion: string,
  cantidad: number
}

export interface PanelNivelGobierno {
  gn: number,
  gr: number
  gl: number
}