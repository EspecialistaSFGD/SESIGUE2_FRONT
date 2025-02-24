export interface PaginationResponse {
  pageIndex: number,
  pageSize: number,
  total: number
}

export interface Pagination {
  code: number,
  columnSort: string,
  typeSort: string,
  pageSize: number,
  currentPage: number,
  total: number
}

export interface PaginationPanel {
  sector?: string,
  tipoEspacio?: string,
  espacio?: string,
  ubigeo?: string
}