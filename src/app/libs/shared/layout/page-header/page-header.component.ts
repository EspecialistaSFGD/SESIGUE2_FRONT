import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef, booleanAttribute } from '@angular/core';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterModule } from '@angular/router';
import { AnchorModel } from '../../../models/shared/anchor.model';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpaceModule,
    NzIconModule,
    NzButtonModule,
    RouterModule,
  ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.less',
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: false }) subtitle!: string;
  @Input({ required: false }) content!: TemplateRef<any>;
  @Input({ required: false }) buttons!: AnchorModel[];
  // @Input({ transform: booleanAttribute }) withShadow: boolean = false;
}
