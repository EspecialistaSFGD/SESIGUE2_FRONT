import { DataResponses } from "./helpers.interface";

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