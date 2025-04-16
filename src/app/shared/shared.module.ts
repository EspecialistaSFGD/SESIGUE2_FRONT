import { NgModule } from '@angular/core';
import { ChartComponent } from './chart/chart.component';
import { GeoChartComponent } from './geo-chart/geo-chart.component';
import { TableCardComponent } from './table-card/table-card.component';
import { SliderTinyComponent } from './slider-tiny/slider-tiny.component';
import { EstadoTagComponent } from './estado-tag/estado-tag.component';



@NgModule({
  declarations: [],
  imports: [
    ChartComponent,
    GeoChartComponent,
    TableCardComponent,
    SliderTinyComponent,
    EstadoTagComponent
  ],
  exports: [
    ChartComponent,
    GeoChartComponent,
    TableCardComponent,
    SliderTinyComponent,
    EstadoTagComponent
  ]
})
export class SharedModule { }
