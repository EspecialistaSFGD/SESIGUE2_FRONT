import { NgModule } from '@angular/core';
import { ChartComponent } from './chart/chart.component';
import { GeoChartComponent } from './geo-chart/geo-chart.component';



@NgModule({
  declarations: [],
  imports: [
    ChartComponent,
    GeoChartComponent
  ],
  exports: [
    ChartComponent,
    GeoChartComponent
  ]
})
export class SharedModule { }
