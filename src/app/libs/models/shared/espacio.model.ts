
export class EspacioModel {
    constructor(
        public eventoId: number,
        public nombre: string,
        public vigente: number,
        public orden: number,
        public subTipo: string,
        public estado: number,
    ) { }
}
