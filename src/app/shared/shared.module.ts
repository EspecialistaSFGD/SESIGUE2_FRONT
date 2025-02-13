import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';



@NgModule({
  declarations: [],
  imports: [
    // CommonModule,
    BarChartComponent
  ],
  exports: [
    BarChartComponent
  ]
})
export class SharedModule { }
