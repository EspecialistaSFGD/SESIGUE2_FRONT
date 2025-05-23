import { DataResponses } from "./helpers.interface"

export interface IntervencionesEspaciosResponses extends DataResponses {
  data: IntervencionEspacioResponse[]
}

export interface IntervencionEspacioResponses extends DataResponses {
	data: IntervencionEspacioResponse
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
	beneficiarios?: string,
	costoActualizado?: string,
	devAcumulado?: string,
	pia?: string,
	pim?: string,
	devengado?: string,
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

export interface IntervencionEspacioTipo {
	tipoId: string,
	tipo: string,
}

export interface IntervencionEspacioSubTipo {
	subTipoId: string,
	subTipo: string,
	tipoId: string,
}

export interface DataModalIntervencion {
	create: boolean
}