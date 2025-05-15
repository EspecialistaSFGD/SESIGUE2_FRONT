import { DataResponses } from "./helpers.interface"

export interface InversionesEspaciosResponses extends DataResponses {
  data: InversionEspacioResponse[]
}

export interface InversionEspacioResponses extends DataResponses {
	data: InversionEspacioResponse
}

export interface InversionEspacioResponse {
	inversionEspacioId?: string,
	inversionId: string,
	eventoId: string,
	evento?: string,
	origenId: string,
	interaccionId: string,
	acuerdoId: string,
	fechaRegistro?: string,
	tipoInversion?: string,
	tipo?: string,
	subTipoInversion?: string,
	subTipo?: string,
	codigoInversion?: string,
	nombreInversion?: string,
	entidadSectorId?: string,
	sectorId?: string,
	sector?: string,
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
	inicioInversionHitoId: string,
	inicioInversionHito?: string,
	inicioInversionEtapaId?: string,
	inicioInversionEtapa?: string,
	inicioInversionFaseId?: string,
	inicioInversionFase?: string,
	objetivoInversionHitoId: string,
	objetivoInversionHito?: string,
	objetivoInversionEtapaId?: string,
	objetivoInversionEtapa?: string,
	objetivoInversionFaseId?: string,
	objetivoInversionFase?: string,
}