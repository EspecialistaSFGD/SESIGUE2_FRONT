import { NgModule } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from "primeng/calendar";
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';


@NgModule({
  declarations: [],
  imports: [
    DropdownModule,
    CalendarModule,
    TableModule,
    TooltipModule
  ],
  exports: [
    DropdownModule,
    CalendarModule,
    TableModule,
    TooltipModule
  ]
})
export class PrimeNgModule { }
