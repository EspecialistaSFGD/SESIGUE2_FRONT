import { DataResponses } from "./helpers.interface";

export interface IntervencionesPanelResponses extends DataResponses {
  data: IntervencionPanel,
}


export interface IntervencionPanel {
	intervencionUbigeo?: InterfacePanelUbigeo[]
}

export interface InterfacePanelUbigeo {
    departamento: string,
	cantIntervenciones: number,
	costoActualizado: string,
	devAcumulado: string,
	pim: string,
	devengado: string,
	avance: number,
}