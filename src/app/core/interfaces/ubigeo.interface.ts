export interface UbigeoEntidad {
  id: number,
  department: number,
  province: number,
  district: number,
}

export interface UbigeosResponses {
  success: boolean,
  message: string,
  errors?: string,
  info?: string,
}

export interface UbigeosDepartamentosResponses extends UbigeosResponses {
  data: UbigeoDepartmentResponse[]
}

export interface UbigeoDepartmentResponse {
  departamentoId: string,
  departamento: string,
  oficial: string,
  jne: string
}

export interface UbigeosProvinciasResponses extends UbigeosResponses {
  data: UbigeoProvinciaResponse[]
}

export interface UbigeoProvinciaResponse {
  provinciaId: string,
  provincia: string,
  oficial: string,
  jne: string
}

export interface UbigeosDistritosResponses extends UbigeosResponses {
  data: UbigeoDistritoResponse[]
}

export interface UbigeoDistritoResponse {
  distritoId: string,
  distrito: string,
  oficial: string,
  jne: string
}

export interface ListUbigeoResponse {
  provincias: UbigeoProvinciaResponse[],
  distritos: UbigeoDistritoResponse[],
}
