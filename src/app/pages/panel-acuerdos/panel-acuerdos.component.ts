import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { kindChart } from '@core/enums';
import { ConfigChart, ItemInfo } from '@core/interfaces';
import { DepartamentosService, DistritosService, ProvinciasService } from '@core/services';
import { environment } from '@environments/environment';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';
import { TinySliderInstance, tns } from 'tiny-slider';

@Component({
  selector: 'app-panel-acuerdos',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule, SharedModule],
  templateUrl: './panel-acuerdos.component.html',
  styles: ``
})
export default class PanelAcuerdosComponent {

  slide!: TinySliderInstance;

  cardInfo: ItemInfo[] = []
  firstGroup: string[] = ['Acuerdos por departamento','Cumplimiento de acuerdos por Departamento','Cumplimiento de acuerdos por Sector']

  chartAcuerdosProceso!: ConfigChart
  chartAcuerdosVencidos!: ConfigChart
  chartProyeccionCumplimientosHitos!: ConfigChart
  mapChar!: ConfigChart
  
  private fb = inject(FormBuilder);
  private mapaDepartamentosService = inject(DepartamentosService)
  private mapaProvinciasService = inject(ProvinciasService)
  private mapaDistritosService = inject(DistritosService)

  formPanel: FormGroup = this.fb.group({
    sector: [ '' ],
    tipoEspacio: [ '' ],
    espacio: [ '' ],
    departamento: [ '' ],
    provincia: [ '' ],
    distrito: [ '' ],
  })


  ngAfterViewInit(): void {
    this.tinySlider()    
  }

  ngOnInit(): void {    
    this.obtenerCardInfo()
    this.obtenerAcuerdosProceso()
    this.obtenerAcuerdosVencidos()
    this.obtenerProyeccionCumplimientoHitos()
    this.obtenerServicioDepartamento()
  }

  tinySlider(){
    this.slide = tns({
      container: '.slider-container',
      items: 1,
      gutter: 12,
      "mouseDrag": true,
      "slideBy": "page",
      "swipeAngle": false,
      "speed": 400,
      "rewind": true,
      controlsContainer: "#controls-slider-container",
      prevButton: '#prev',
      nextButton: '#next',
      arrowKeys: true,
      "nav": false,
      responsive: {
        575: {
          items: 2
        },
        576: {
          items: 2
        },
        768: {
          items: 3
        },
        992: {
          items: 4
        },
        1200: {
          items: 6
        },
        1600: {
          items: 7,
          "mouseDrag": false,
        },
      }
    });
  }

  obtenerCardInfo(){
    this.cardInfo = [
      { icono: 'acuerdos-total.svg', titulo: '2700', descripcion: 'Acuerdos establecidos', comentario: 'Acuerdos generados en las reuniones bilaterales' },
      { icono: 'acuerdos-desestimado.svg', titulo: '48', descripcion: 'Acuerdos desestimados', comentario: 'Acuerdos que, por razón justificada, y en coordinación entre las partes, dejan de ser consideradas para la medición' },
      { icono: 'acuerdos-vigente.svg', titulo: '2652', descripcion: 'Acuerdos vigentes', comentario: 'Resultado de la diferencia de acuerdos establecidos menos los desestimados' },
      { icono: 'acuerdos-cumplido.svg', titulo: '1844', descripcion: 'Acuerdos cumplidos', comentario: 'Acuerdos que han sido cumplidos por el gobierno Nacional, regional y/o local' },
      { icono: 'acuerdos-proceso.svg', titulo: '679', descripcion: 'Acuerdos en proceso', comentario: 'Acuerdos que se encuentran dentro del plazo para su cumplimiento' },
      { icono: 'acuerdos-pendiente.svg', titulo: '120', descripcion: 'Acuerdos pendientes', comentario: 'Acuerdos que no tienen definidos los hitos para su cumplimiento' },
      { icono: 'acuerdos-vencido.svg', titulo: '2700', descripcion: 'Acuerdos vencidos', comentario: 'Acuerdos que superaron el plazo establecido para su cumplimiento' }
    ]
  }

  obtenerAcuerdosProceso(){
    this.chartAcuerdosProceso = {
      kind: kindChart.BarChart,
      data: [
        {
          "titulo": "CUMPLIDOS",
          "cantidad": 15
        },
        {
          "titulo": "PROCESO",
          "cantidad":5
        },
        {
          "titulo": "PENDIENTE",
          "cantidad": 25
        },
        {
          "titulo": "VENCIDO",
          "cantidad": 40
        }
      ],
      axisX: {
        title: 'titulo',
        showTitle: false
      },
      axisY: {
        title: 'cantidad',
        showTitle: false,
        showValue: true,
        axisValue: 'cantidad'
      },
      legend: false
    }
  }


  obtenerAcuerdosVencidos(){
    this.chartAcuerdosVencidos = {
      kind: kindChart.BarChart,
      data: [
        {
          "titulo": "CUMPLIDOS",
          "cantidad": 10
        },
        {
          "titulo": "PROCESO",
          "cantidad": 50
        },
        {
          "titulo": "PENDIENTE",
          "cantidad": 5
        },
        {
          "titulo": "VENCIDO",
          "cantidad": 20
        }
      ],
      axisX: {
        title: 'titulo',
        showTitle: false
      },
      axisY: {
        title: 'cantidad',
        showTitle: false,
        showValue: true,
        axisValue: 'cantidad'
      },
      legend: false
    }
  }

  obtenerProyeccionCumplimientoHitos(){
    this.chartProyeccionCumplimientosHitos = {
      kind: kindChart.LineChart,
      data: [
        { month: 'Jan', city: 'Tokyo', temperature: 2 },
        { month: 'Jan', city: 'London', temperature: 3.9 },
        { month: 'Feb', city: 'Tokyo', temperature: 6.9 },
        { month: 'Feb', city: 'London', temperature: 4.2 },
        { month: 'Mar', city: 'Tokyo', temperature: 9.5 },
        { month: 'Mar', city: 'London', temperature: 5.7 },
        { month: 'Apr', city: 'Tokyo', temperature: 14.5 },
        { month: 'Apr', city: 'London', temperature: 8.5 },
        { month: 'May', city: 'Tokyo', temperature: 18.4 },
        { month: 'May', city: 'London', temperature: 11.9 },
        { month: 'Jun', city: 'Tokyo', temperature: 21.5 },
        { month: 'Jun', city: 'London', temperature: 15.2 },
      ],
      axisX: {
        title: 'month',
        showTitle: false
      },
      axisY: {
        title: 'temperature',
        showTitle: false
      },
      legend: false
    }
  }

  obtenerServicioDepartamento(){
    // const { topoJsonUrl, rqDataFeature } = this.getTopoJsonUrlAndFeature('220602');

    // console.log(topoJsonUrl,rqDataFeature);
    // const mapaDepartamentos = this.mapaDepartamentosService.obtenerDepartamentosServicio('220602')
    // console.log(mapaDepartamentos);

    this.mapChar = {
      kind: kindChart.GeoChart,
      data: [
        { month: 'Jan', city: 'Tokyo', temperature: 2 },
        { month: 'Jan', city: 'London', temperature: 3.9 },
        { month: 'Feb', city: 'Tokyo', temperature: 6.9 },
        { month: 'Feb', city: 'London', temperature: 4.2 },
        { month: 'Mar', city: 'Tokyo', temperature: 9.5 },
        { month: 'Mar', city: 'London', temperature: 5.7 },
        { month: 'Apr', city: 'Tokyo', temperature: 14.5 },
        { month: 'Apr', city: 'London', temperature: 8.5 },
        { month: 'May', city: 'Tokyo', temperature: 18.4 },
        { month: 'May', city: 'London', temperature: 11.9 },
        { month: 'Jun', city: 'Tokyo', temperature: 21.5 },
        { month: 'Jun', city: 'London', temperature: 15.2 },
      ],
      axisX: {
        title: 'month',
        showTitle: false
      },
      axisY: {
        title: 'temperature',
        showTitle: false
      },
      legend: false
    }

    // const geoChart = new Chart({
    //       container: 'container',
    //       autoFit: true,
    //     });
    
    
  }
}
