import { Token } from "./token.model";

export class Usuario {
    constructor(
        public usuario?: string,
        public clave?: string,
        public refreshToken?: Token,
        public token?: Token,
    ) { }
}
