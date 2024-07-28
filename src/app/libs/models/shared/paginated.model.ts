export class PaginatedModel {
    constructor(
        public pageIndex: number,
        public pageSize: number,
        public sortField: string,
        public sortOrder: string,
    ) { }
}