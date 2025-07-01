import { DataResponses } from "./helpers.interface";

export interface IntervencionesPanelResponses extends DataResponses {
  data: IntervencionPanel,
}


export interface IntervencionPanel {
	intervencionUbigeo?: InterfacePanelResult[]
	intervencionSectores?: InterfacePanelResult[]
	intervencionEstados?: InterfacePanelResult[]
	intervencionNivelesGobierno?: InterfacePanelResult[]
}

export interface InterfacePanelResult {
    nombre: string,
	cantIntervenciones: number,
	costoActualizado: number,
	devAcumulado: number,
	pim: number,
	inversionActual: number,
	devengado: number,
	avance: number,
}
// export interface InterfacePanelUbigeo {
//     departamento: string,
// 	cantIntervenciones: number,
// 	costoActualizado: string,
// 	devAcumulado: string,
// 	pim: string,
// 	devengado: string,
// 	avance: number,
// }

// export interface InterfacePanelSector {
//     sector: string,
// 	costoActualizado: string,
// 	devAcumulado: string,
// 	pim: string,
// 	devengado: string,
// 	avance: number,
// }

// export interface InterfacePanelEstado {
//     estado: string,
// 	cantIntervenciones: number,
// 	costoActualizado: string,
// 	devAcumulado: string,
// 	pim: string,
// 	devengado: string,
// 	avance: number,
// }

// export interface InterfacePanelNivelGobierno {
//     nivelGobierno: string,
// 	cantIntervenciones: number,
// 	costoActualizado: string,
// 	devAcumulado: string,
// 	pim: string,
// 	devengado: string,
// 	avance: number,
// }