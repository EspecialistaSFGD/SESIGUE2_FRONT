export class MenuModel {
    constructor(
        public id: string,
        public nombre: string,
        public url?: string,
        public icono?: string,
        public opciones?: MenuModel[],
    ) { }
}
