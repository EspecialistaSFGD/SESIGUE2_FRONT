export class StepModel {
    constructor(
        public id: number,
        public title: string,
        public description?: string,
        public status?: string,
        public async?: boolean,
        public percentage?: number,
    ) { }
}
