import { SelectModel } from "../select.model";

export class AcuerdoPedidoModel {
    constructor(
        public idAcuerdo?: number,
        public idPedido?: number,
        public pedido?: SelectModel,
        // public idSector?: number,
        // public sector?: SelectModel,
        // public idUbicacion?: number,
        // public ubicacion?: SelectModel,
        // public idEjeEstrategico?: number,
        // public ejeEstrategico?: SelectModel,
        // public idTipoIntervencion?: number,
        // public tipoIntervencion?: SelectModel,
        // public pedido?: string,
        // public idPedido?: number,
        public acuerdo?: string,
        // public cui?: string,
        // public cantidadPreAcuerdos?: number,
        // public comentarioPcm?: string,
        public codigo?: string,
        public plazo?: Date,
        //TODO: validar si es necesario
        public estado?: SelectModel,
    ) { }
}