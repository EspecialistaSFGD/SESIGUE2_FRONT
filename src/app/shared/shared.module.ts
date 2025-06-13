import { NgModule } from '@angular/core';
import { ChartComponent } from './chart/chart.component';
import { GeoChartComponent } from './geo-chart/geo-chart.component';
import { TableCardComponent } from './table-card/table-card.component';
import { SliderTinyComponent } from './slider-tiny/slider-tiny.component';
import { EstadoTagComponent } from './estado-tag/estado-tag.component';
import { BotonDescargarComponent } from './boton/boton-descargar/boton-descargar.component';
import { ProgressSpinerComponent } from './progress-spiner/progress-spiner.component';
import { FormularioComentarComponent } from './formulario-comentar/formulario-comentar.component';




@NgModule({
  declarations: [],
  imports: [
    ChartComponent,
    GeoChartComponent,
    TableCardComponent,
    SliderTinyComponent,
    EstadoTagComponent,
    BotonDescargarComponent,
    ProgressSpinerComponent,
    FormularioComentarComponent
  ],
  exports: [
    ChartComponent,
    GeoChartComponent,
    TableCardComponent,
    SliderTinyComponent,
    EstadoTagComponent,
    BotonDescargarComponent,
    ProgressSpinerComponent,
    FormularioComentarComponent
  ]
})
export class SharedModule { }
