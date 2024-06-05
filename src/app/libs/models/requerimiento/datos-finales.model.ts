import { SelectModel } from "../select.model";

export class DatosFinalesModel {
    constructor(
        public idRequerimiento: number,
        public idPedidoSiga?: string,
        public pedidoSiga?: File,
        public pedidoSigaNombre: string = '',
    ) { }
}
