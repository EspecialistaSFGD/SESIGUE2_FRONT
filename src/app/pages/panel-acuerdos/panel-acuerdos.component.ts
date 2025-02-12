import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ItemInfo } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { TinySliderInstance, tns } from 'tiny-slider';

@Component({
  selector: 'app-panel-acuerdos',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule],
  templateUrl: './panel-acuerdos.component.html',
  styles: ``
})
export default class PanelAcuerdosComponent {

  slide!: TinySliderInstance;

  cardInfo: ItemInfo[] = []
  firstGroup: number[] = [1,2,3]
  
  private fb = inject(FormBuilder);

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

}
