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
export interface ButtonsActions {
	new?: boolean,
	edit?: boolean,
	delete?: boolean,
  view?: boolean,
  upload?: boolean
}