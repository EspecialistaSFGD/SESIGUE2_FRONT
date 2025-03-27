import { NgModule } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from "primeng/calendar";
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';


@NgModule({
  declarations: [],
  imports: [
    DropdownModule,
    CalendarModule,
    TableModule,
    TooltipModule,
    MultiSelectModule
  ],
  exports: [
    DropdownModule,
    CalendarModule,
    TableModule,
    TooltipModule,
    MultiSelectModule
  ]
})
export class PrimeNgModule { }
