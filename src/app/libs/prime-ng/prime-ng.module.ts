import { NgModule } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from "primeng/calendar";
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { StepperModule } from 'primeng/stepper';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FieldsetModule } from 'primeng/fieldset';
import { MenubarModule } from 'primeng/menubar';


@NgModule({
  declarations: [],
  imports: [
    DropdownModule,
    CalendarModule,
    TableModule,
    TooltipModule,
    MultiSelectModule,
    RadioButtonModule,
    InputNumberModule,
    StepperModule,
    InputSwitchModule,
    ProgressSpinnerModule,
    FieldsetModule,
    MenubarModule
  ],
  exports: [
    DropdownModule,
    CalendarModule,
    TableModule,
    TooltipModule,
    MultiSelectModule,
    RadioButtonModule,
    InputNumberModule,
    StepperModule,
    InputSwitchModule,
    ProgressSpinnerModule,
    FieldsetModule,
    MenubarModule
  ]
})
export class PrimeNgModule { }
