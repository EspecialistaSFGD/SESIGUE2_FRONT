export class PedidoModel {
    constructor(
        public prioridadID?: number,
        public espacio?: string,
        public sector?: string,
        public ubigeo?: string,
        public region?: string,
        public provincia?: string,
        public objetivoEstrategicoTerritorial?: string,
        public intervencionesEstrategicas?: string,
        public aspectoCriticoResolver?: string,
        public validado?: number,
        public cuis?: string,
        public cantidadPreAcuerdos?: number,
        public cantidadAcuerdos?: number,
        public eventoId?: number,
        public sectorid?: number,
        public depaid?: number,
        public provid?: number,

    ) { }
}
