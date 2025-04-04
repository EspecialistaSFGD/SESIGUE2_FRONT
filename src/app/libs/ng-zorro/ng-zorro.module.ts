import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NzFormModule,
    NzRadioModule,
    NzInputModule,
    NzModalModule,
    NzDatePickerModule,
    NzSelectModule,
    NzIconModule,
    NzUploadModule,
    NzCollapseModule,
    NzSpaceModule,
    NzInputNumberModule,
    NzButtonModule,
    NzTableModule,
    NzTabsModule,
    NzDrawerModule,
    NzCardComponent,
    NzPageHeaderModule,
    NzStatisticModule,
    NzProgressModule,
    NzToolTipModule,
    NzBadgeModule,
    NzDescriptionsModule,
    NzAvatarComponent,
    NzTagModule,
    NzDropDownModule
  ],
  exports: [
    NzFormModule,
    NzRadioModule,
    NzInputModule,
    NzModalModule,
    NzDatePickerModule,
    NzSelectModule,
    NzIconModule,
    NzUploadModule,
    NzCollapseModule,
    NzSpaceModule,
    NzInputNumberModule,
    NzButtonModule,
    NzTableModule,
    NzTabsModule,
    NzDrawerModule,
    NzCardComponent,
    NzPageHeaderModule,
    NzStatisticModule,
    NzProgressModule,
    NzToolTipModule,
    NzBadgeModule,
    NzDescriptionsModule,
    NzAvatarComponent,
    NzTagModule,
    NzDropDownModule
  ]
})
export class NgZorroModule { }
