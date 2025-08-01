import { EstadoEventoType } from "../../shared/types/estado.type";
import { SeguridadModel } from "../shared/seguridad.model";
import { SelectModel } from "../shared/select.model";

export class PedidoModel extends SeguridadModel {
    constructor(
        public prioridadID?: number,
        public codigo?: string,
        public espacioSelect?: SelectModel,
        public sectorSelect?: SelectModel,
        public ubigeo?: string,
        public departamentoSelect?: SelectModel,
        public provinciaSelect?: SelectModel,
        public distritoSelect?: SelectModel,
        public ejeEstrategicoSelect?: SelectModel,
        public tipoIntervencionSelect?: SelectModel,
        public aspectoCriticoResolver?: string,
        public validado?: number,
        public cuis?: string,
        public cantidadPreAcuerdos?: number,
        public cantidadAcuerdos?: number,
        public fechaEvento?: Date,
        public fechaFinEvento?: Date,
        public descripcionEstadoEspacio?: string,
        public estadoEvento?: EstadoEventoType,
        // public eventoId?: number,
        // public sectorid?: number,
        // public depaid?: number,
        // public provid?: number,
        public comentarioPcm?: string,
        public comentarioPCM?: string,
        public eventoId?: number | null,

        public espacio?: string,
        public sector?: string,
        public region?: string,
        public provincia?: string,
        public distrito?: string,
        public objetivoEstrategicoTerritorial?: string,
        public intervencionesEstrategicas?: string,

        public tipoCodigoSelect?: SelectModel,
        public tipoCodigo?: number,
        public tipoInversionId?: number,

        public codigoPerfil?: number,
        public ubicacion?: string,
        public usuarioId?: string
    ) {
        super();
    }
}

export class PedidoResponseModel {
    constructor(
        public prioridadID?: number,
        public espacio?: string,
        public sector?: string,
        public ubigeo?: string,
        public region?: string,
        public provincia?: string,
        public ejeEstrategicoId?: number,
        public tipoIntervencionId?: number,
        public objetivoEstrategicoTerritorial?: string,
        public intervencionesEstrategicas?: string,
        public ejeEstrategicoSelect?: SelectModel,
        public tipoIntervencionSelect?: SelectModel,
        public aspectoCriticoResolver?: string,
        public validado?: number,
        public cuis?: string,
        public cantidadPreAcuerdos?: number,
        public cantidadAcuerdos?: number,
        public eventoId?: number,
        public espacioSelect?: SelectModel,
        public sectorid?: number,
        public sectorSelect?: SelectModel,
        public depaid?: number,
        public provid?: number,
        public comentarioPcm?: string,
        public descripcionEstadoEspacio?: string,
        public estadoEvento?: EstadoEventoType,
        public tipoInversionId?: number,
        public tipoCodigoSelect?: any,
        public distrito?: string,
        public ubicacion?: string,
    ) { }
}

export class PedidoRequestModel {
    constructor(
        public prioridadId?: number,
        public eventoId?: number,
        public grupoId?: number,
        public ubigeo?: string,
        public espacioId?: number,
        public cuis?: string,
        public estado?: number,
        public tipoIntervencionId?: number,
        public intervencionesEstrategicas?: string,
        public ejeEstrategicoId?: number,
        public objetivoEstrategicoTerritorial?: string,
        public aspectoCriticoResolver?: string,
        public accesoId?: number,
        public entidadIdOrigen?: number,
        public entidadIdDestino?: number,
        public comentarioPcm?: string,
        public codigoPerfil?: number,
        public tipoInversionId?: number,
        public usuarioId?: string,

        // public ubigeo?: string,
        // public region?: string,
        // public provincia?: string,
        // public validado?: number,
        // public cantidadPreAcuerdos?: number,
        // public cantidadAcuerdos?: number,

    ) { }
}
