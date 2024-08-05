import { AccionType } from "../../shared/types/accion.type";
import { AcuerdoType } from "../../shared/types/acuerdo.type";

export class AddEditAcuerdoModel {
    constructor(
        public tipo?: AcuerdoType,
        public accion?: AccionType,
    ) { }
}
