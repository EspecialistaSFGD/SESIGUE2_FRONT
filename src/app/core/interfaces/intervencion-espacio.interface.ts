import { DataResponses } from "./helpers.interface"

export interface IntervencionesEspaciosResponses extends DataResponses {
  data: IntervencionEspacioResponse[]
}

export interface IntervencionEspacioResponses extends DataResponses {
	data: IntervencionEspacioResponse
}

export interface ProcesoIntervencionEspacioResponses extends DataResponses {
	data: procesoIntervencionEspacio
}

export interface IntervencionEspacioResponse {
	intervencionEspacioId?: string,
	intervencionId: string,
	eventoId: string,
	evento?: string,
	resumen?: string,
	origen: string,
	interaccionId: string,
	acuerdoId: string,
	fechaSsi?: string,
	fechaRegistro?: string,
	tipoIntervencion?: string,
	tipoEventoId?: string,
	tipo?: string,
	subTipoIntervencion?: string,
	subTipo?: string,
	codigoIntervencion?: string,
	nombreIntervencion?: string,
	entidadSectorId?: string,
	sectorId?: string,
	sector?: string,
	entidadUbigeoId?: string,
	departamento?: string,
	provincia?: string,
	distrito?: string,
	entidad?: string,
	entidadTipo?: string,
	entidadSlug?: string,
	beneficiarios?: string,
	costoActualizado?: string,
	devAcumulado?: string,
	pia?: string,
	pim?: string,
	devengado?: string,
	usuarioId?:string,
	usuarioIdRegistro?: string,
	usuarioIdModifica?: string,
	cantidadTareas?: number,
	fechaSituacion?: number,
	situacion?: number,
	inicioIntervencionHitoId: string,
	inicioIntervencionHito?: string,
	inicioIntervencionEtapaId?: string,
	inicioIntervencionEtapa?: string,
	inicioIntervencionFaseId?: string,
	inicioIntervencionFase?: string,
	actualIntervencionHitoId: string,
	actualIntervencionHito?: string,
	actualIntervencionEtapaId?: string,
	actualIntervencionEtapa?: string,
	actualIntervencionFaseId?: string,
	actualIntervencionFase?: string,
	objetivoIntervencionHitoId: string,
	objetivoIntervencionHito?: string,
	objetivoIntervencionEtapaId?: string,
	objetivoIntervencionEtapa?: string,
	objetivoIntervencionFaseId?: string,
	objetivoIntervencionFase?: string,
}

export interface procesoIntervencionEspacio {
	fecha: string,
}

export interface IntervencionEspacioTipo {
	tipoId: string,
	tipo: string,
}

export interface IntervencionEspacioSubTipo {
	subTipoId: string,
	subTipo: string,
	tipoId: string,
}

export interface IntervencionEspacioOriginResponse {
	origen: string,
	interaccionId: string,
	eventoId: string
}

export interface DataModalIntervencion {
	create: boolean,
	intervencionEspacio: IntervencionEspacioResponse
	sectores: number[],
	ubigeos: string[]
}