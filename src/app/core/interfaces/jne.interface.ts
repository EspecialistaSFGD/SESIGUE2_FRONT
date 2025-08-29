import { JneAutoridadTipoEnum } from "@core/enums"
import { DataResponses } from "./helpers.interface"

export interface JneAutoridadesResponses extends DataResponses {
  data: JneAutoridadResponse[]
}

export interface JneAutoridadResponses extends DataResponses {
  data: JneAutoridadResponse
}

export interface JneAutoridadResponse {
    organizacionPolitica: string,
    sexo: string,
    documentoIdentidad: string,
    nombres: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    cargo: string,
    fechaInicioVigencia: string,
    fechaFinVigencia: string,
    conformacionDetalleId: number,
    hojaVidaId: number,
    rutaFoto: string,
    departamento: string,
    provincia: string,
    distrito: string,
    rutaPlanGob: string,
    reemplaza: string,
    procesoElectoral: string,
    ubigeo?: string,
    distritoElectoral?: string,
}

export interface JneAutoridadParams {
    tipo: JneAutoridadTipoEnum
    ubigeo: string,
}