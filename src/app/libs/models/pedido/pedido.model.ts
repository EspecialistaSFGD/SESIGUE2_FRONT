import { SelectModel } from "../select.model";

export class PedidoModel {
    constructor(
        public idPedido?: number,
        public idSector?: number,
        public sector?: SelectModel,
        public idUbicacion?: number,
        public ubicacion?: SelectModel,
        public idEjeEstrategico?: number,
        public ejeEstrategico?: SelectModel,
        public idTipoIntervencion?: number,
        public tipoIntervencion?: SelectModel,
        public pedido?: string,
        public cui?: string,
        public cantidadPreAcuerdos?: number,
        public comentarioPcm?: string,
        //TODO: validar si es necesario
        public estado?: SelectModel,
    ) { }
}