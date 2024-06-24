export class PerfilResponseModel {
    constructor(
        public codigoPerfil?: number,
        public descripcionPerfil?: string,
        public descripcionExtensa?: string,
        public fechaRegistro?: string,
        public esActivo?: boolean,
        public descripcionEstado?: string,
    ) { }
}
