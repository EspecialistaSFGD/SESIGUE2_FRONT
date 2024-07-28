export class SeguridadModel {
    constructor(
        public fechaRegistro?: Date,
        public esActivo?: boolean,
        public codigoUsuario?: number,
        public codigoModifica?: number,
        public accesoId?: number,
    ) { }
}