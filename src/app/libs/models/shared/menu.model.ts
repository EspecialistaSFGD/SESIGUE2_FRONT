export class MenuModel {
    constructor(
        public codigoMenu: number,
        public descripcionItem: string,
        public direccionUrl: string,
        public parentMenu: number,
        public iconoMenu?: string,
        public ordenMenu?: number,
        public botones?: any[],
        public children?: MenuModel[],
    ) { }
}