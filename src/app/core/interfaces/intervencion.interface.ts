import { DataResponses } from "./helpers.interface";

export interface IntervencionesPanelResponses extends DataResponses {
  data: IntervencionPanel,
}


export interface IntervencionPanel {
	intervencionUbigeo: InterfacePanelUbigeo[]
}

export interface InterfacePanelUbigeo {
    departamento: string,
		cantIntervenciones: number,
		costoActualizado: number,
		devAcumulado: number,
		pim: number,
		devengado: number,
		avance: number,
}