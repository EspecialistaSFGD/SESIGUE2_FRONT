import { NzButtonType } from "ng-zorro-antd/button";

export class AnchorModel {
    constructor(
        public title?: string,
        public href?: string,
        public icon?: string,
        public type?: NzButtonType,
    ) { }
}
