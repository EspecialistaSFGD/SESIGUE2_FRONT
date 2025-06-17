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
	origenId: string,
	interaccionId: string,
	acuerdoId: string,
	fechaRegistro?: string,
	tipoIntervencion?: string,
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
	usuarioIdRegistro?: string,
	usuarioIdModifica?: string,
	inicioIntervencionHitoId: string,
	inicioIntervencionHito?: string,
	inicioIntervencionEtapaId?: string,
	inicioIntervencionEtapa?: string,
	inicioIntervencionFaseId?: string,
	inicioIntervencionFase?: string,
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
	create: boolean
	origen: IntervencionEspacioOriginResponse,
	sectores: number[],
	ubigeos: string[]
}