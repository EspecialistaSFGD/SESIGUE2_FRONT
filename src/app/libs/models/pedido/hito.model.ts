import { SelectModel } from "../shared/select.model";

export class HitoAcuerdoModel {
    constructor(
        public codigoUsuario?: string | null,
        public hito?: string | null,
        public responsableID?: number | null,
        public responsableId?: number | null,
        public responsable?: string | null,
        public responsableSelect?: SelectModel | null,
        public plazo?: string | null,
        public plazoFecha?: Date | null,
        public comentarioSD?: string | null,
        public estado?: number | null,
        public estadoRegistro?: number | null,
        public hitoId?: number | null,
        public acuerdoID?: number | null,
        public acuerdoId?: number | null,
        public nomEstado?: string | null,
        public entidadId?: number | null,
        public entidad?: string,
        public entidadSelect?: SelectModel | null,
        public validado?: number | null,
        public fechaValidacion?: string | null,
        public nomContacto?: string | null,
        public telefContacto?: string | null,
        public accesoId?: number | null,
        public region?: string,
        public provincia?: string,
        public distrito?: string,
        public ubicacion?: string,
        public estadoValidado?: string,
    ) { }
}

export class HitoAcuerdoRequestModel {
    constructor(
        public accesoId?: number | null,
        public hitoId?: number | null,
    ) { }
}