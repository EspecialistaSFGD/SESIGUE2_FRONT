import { DataResponses } from "./helpers.interface";

export interface IntervencionesResponses extends DataResponses {
  data: IntervencionResponse[]
}

export interface IntervencionResponses extends DataResponses {
  data: IntervencionResponse
}

export interface IntervencionResponse {
	intervencionId?: string,
	tipoIntervencion: string,
	subTipoIntervencion: string,
	codigoIntervencion: string,
	nombreProyecto: string,
	pia: number,
	pim: number,
	devengado: number,
	compromiso: number,
	certificado: number,
	fechaSsi: string,
	entidadSectorId: string,
	sectorId: string,
	sector: string,
	entidadSector: string,
	entidadUbigeoId: string,
	entidadUbigeo: string,
	nivelGobiernoId: string,
	nivelGobierno: string,
	actualIntervencionHitoId: string,
	intervencionHitoActual: string,
	actualIntervencionEtapaId: string,
	intervencionEtapaActual: string,
	actualIntervencionFaseId: string,
	intervencionFaseActual: string,
}

export interface IntervencionesPanelResponses extends DataResponses {
  data: IntervencionPanel,
}

export interface IntervencionPanel {
	intervencionInfo?: InterfacePanelInfoResult
	intervencionUbigeo?: InterfacePanelResult[]
	intervencionSectores?: InterfacePanelResult[]
	intervencionEstados?: InterfacePanelResult[]
	intervencionNivelesGobierno?: InterfacePanelResult[]
	intervencionFinanciamiento?: InterfacePanelFinanciamientoResult[]
}

export interface InterfacePanelInfoResult {
	aptos: number,
	viable: number,
	concluidos: number,
	ejecucion: number,
	paralizados: number,
	ideas: number,
}

export interface InterfacePanelResult {
	id: number,
    nombre: string,
	cantIntervenciones: number,
	costoActualizado: number,
	devAcumulado: number,
	pim: number,
	inversionActual: number,
	devengado: number,
	avance: number,
}

export interface InterfacePanelFinanciamientoResult extends InterfacePanelResult {
	demanda: number,
}