import { NgModule } from '@angular/core';
import { ChartComponent } from './chart/chart.component';
import { GeoChartComponent } from './geo-chart/geo-chart.component';
import { TableCardComponent } from './table-card/table-card.component';
import { SliderTinyComponent } from './slider-tiny/slider-tiny.component';



@NgModule({
  declarations: [],
  imports: [
    ChartComponent,
    GeoChartComponent,
    TableCardComponent,
    SliderTinyComponent
  ],
  exports: [
    ChartComponent,
    GeoChartComponent,
    TableCardComponent,
    SliderTinyComponent
  ]
})
export class SharedModule { }
