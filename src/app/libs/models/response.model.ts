export class ResponseModel {
    constructor(
        public pageNumber?: number,
        public pageSize?: number,
        public success?: boolean,
        public message?: any,
        public data?: any,
        public errors?: any,
        public totalCount?: number,
    ) { }
}