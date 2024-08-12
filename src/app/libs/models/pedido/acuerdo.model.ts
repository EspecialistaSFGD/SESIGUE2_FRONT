import { ComentarioType } from "../../shared/types/comentario.type";
import { SeguridadModel } from "../shared/seguridad.model";
import { SelectModel } from "../shared/select.model";

export class AcuerdoPedidoModel extends SeguridadModel {
    constructor(
        public codigo?: string,
        public acuerdo?: string,
        public clasificacion?: string,
        public responsable?: string,
        public responsableSelect?: SelectModel,
        public plazo?: Date | null,
        public espacio?: string,
        public sector?: string,
        public region?: string,
        public provincia?: string,
        public ubica?: string,
        public intervencionesEstrategicas?: string,
        public aspectoCriticoResolver?: string,
        public provid?: number,
        public cuis?: string,
        public ubigeo?: string,
        public acuerdoId?: number,
        public clasificacionId?: number,
        public clasificacionSelect?: SelectModel,
        public responsableId?: number,
        public prioridadId?: number,
        public eventoId?: number,
        public prioridadTerritorial?: string,
        public objetivoEstrategicoTerritorial?: string,
        public depaid?: number,
        public sectorId?: number,
        public estadoRegistro?: number,
        public fechaCumplimiento?: Date,
        public nomEstadoRegistro?: string,
        public entidadId?: number,
        public entidad?: string,
        public entidadSelect?: SelectModel,
        public estadoRegistroInterno?: number,
        public tipoId?: number,
        public tipo?: string,
        public tipoSelect?: string | SelectModel,
        public estado?: string,
        public pre_acuerdo?: string,
        public es_preAcuerdoBool?: boolean,
        public es_preAcuerdo?: number,
        public acuerdoModificado?: string,
        public acuerdo_original?: string,
        public evidencia?: File,
        public evidenciaDesestimacion?: string,
        public fechaEvento?: Date | null,

    ) {
        super();
    }
}

export class DesestimacionModel extends SeguridadModel {
    constructor(
        public acuerdoId?: number | null,
        public tipo?: ComentarioType,
        public motivoDesestimacion?: string,
        public evidencia?: File,
        public evidenciaDesestimacion?: string,
    ) {
        super();
    }
}