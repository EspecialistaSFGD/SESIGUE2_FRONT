import { AdjuntoResponse } from "./adjunto.interface";
import { DataResponses } from "./helpers.interface";

export interface ActividadesResponses extends DataResponses {
    data: ActividadResponse[],
}

export interface ActividadResponses extends DataResponses {
    data: ActividadResponse,
}

export interface ActividadResponse {
    eventoId?: string,
    actividadId?: string,
    codigo?: string,
    entidadSectorId: string,
    entidadId?: string,
    entidad?: string,
    departamento?: string,
    provincia?: string,
    distrito?: string,
    ubigeo?: string,
    sectorId?: string,
    sector?: string,
    entidadTipo: string,
    entidadSlug: string,
    horaInicio: string,
    horaFin: string,
    direccion: string,
    destacado: boolean,
    latitud: string,
    longitud: string,
    distancia: string,
    participante: string,
    actividad: string,
    descripcion: string,
    comentarios: string,
    desarrollo: string,
    destacadoPCM: boolean,
    usuarioId: string,
    estado: boolean,
    fechaRegistro: string,
}

export interface DesarrolloActividadResponse {
    actividadId: string,
    descripcion: string,
    adjuntos: AdjuntoResponse[],
    usuarioId: string,
}

export interface DataModalActividad{
  create: boolean,
  actividad: ActividadResponse
}