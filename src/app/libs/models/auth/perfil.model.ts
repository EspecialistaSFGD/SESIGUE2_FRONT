import { SeguridadModel } from "../shared/seguridad.model";
import { SelectModel } from "../shared/select.model";

export class PerfilModel extends SeguridadModel {
    constructor(
        public codigoPerfil?: number,
        public entidadId?: number,
        public descripcionPerfil?: string,
        public descripcionNivel?: string,
        public descripcionSubTipo?: string,
        public descripcionEstado?: string,
        public codigoNivel?: number,
        public subTipoSelect?: SelectModel,
        public codigoSubTipo?: number,
        public nivelSelect?: SelectModel,
    ) {
        super();
    }
}

export class PerfilNivelModel extends SeguridadModel {
    constructor(
        public codigoNivel?: number,
        public codigo?: number,
        public descripcionNivel?: string,
        public fechaModifica?: null,
    ) {
        super();
    }

}

export class PerfilNivelSubTipoModel extends SeguridadModel {
    constructor(
        public codigoSubTipo?: number,
        public codigoNivel?: number,
        public codigo?: string,
        public descripcionSubTipo?: string,
    ) {
        super();
    }
}

export class PerfilBotonModel extends SeguridadModel {
    constructor(
        public codigoBoton?: number,
        public descripcionBoton?: string,
        public iconoBoton?: string,
        public ordenBoton?: number,
        public estado?: number,
        public descripcionEstado?: string,
    ) {
        super();
    }
}

export class PerfilAccesoModel extends SeguridadModel {
    constructor(
        public codigoAcceso?: number,
        public codigoPerfil?: number,
        public descripcionPerfil?: string,
        public codigoMenu?: number,
        public codigoMenuPadre?: number,
        public direccionUrl?: string,
        public descripcionItem?: string,
        public iconoItem?: string,
        public ordenItem?: number,
        public descripcionEstado?: string,
    ) {
        super();
    }
}
