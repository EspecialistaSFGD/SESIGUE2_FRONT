import { DataResponses } from "./helpers.interface";

export interface ActividadesResponses extends DataResponses {
    data: ActividadResponse[],
}

export interface ActividadResponses extends DataResponses {
    data: ActividadResponse,
}

export interface ActividadResponse {
    actividadId?: string,
    entidadSectorId: string,
    entidadUbigeoId: string,
    horaInicio: string,
    horaFin: string,
    direccion: string,
    destacado: string,
    latitud: string,
    longitud: string,
    distancia: string,
    actividad: string,
    descripcion: string,
    comentarios: string,
    desarrollo: string,
    destacadoPCM: string,
    estado: boolean,
    fechaRegistro: string,
}

export interface DataModalActividad{
  create: boolean,
  actividad: ActividadResponse
}