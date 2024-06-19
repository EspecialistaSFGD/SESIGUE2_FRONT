import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute } from '@angular/core';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { AnchorModel } from '../../../libs/models/shared/anchor.model';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-header-full',
  standalone: true,
  imports: [CommonModule, NzPageHeaderModule, NzBreadCrumbModule, NzSpaceModule, NzIconModule, NzButtonModule, RouterModule],
  templateUrl: './page-header-full.component.html',
  styleUrl: './page-header-full.component.less',
})
export class PageHeaderFullComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: false }) description!: string;
  @Input({ required: false }) links!: AnchorModel[];
  @Input({ required: false }) breadcrumbs!: AnchorModel[];
  @Input({ required: false }) buttons!: AnchorModel[];
  @Input({ required: false }) img!: string;
  // @Input({ transform: booleanAttribute }) withShadow: boolean = false;
}
