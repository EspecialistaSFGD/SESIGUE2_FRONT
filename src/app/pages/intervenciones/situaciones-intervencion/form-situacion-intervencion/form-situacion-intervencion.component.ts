import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { DataModalFormIntervencionSituacion, IntervencionEtapaResponse, IntervencionFaseResponse, IntervencionHitoResponse, IntervencionResponse, Pagination } from '@core/interfaces';
import { IntervencionEtapaService, IntervencionFaseService, IntervencionHitoService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-form-situacion-intervencion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './form-situacion-intervencion.component.html',
  styles: ``
})
export class FormSituacionIntervencionComponent {
  readonly dataIntervencionSituacion: DataModalFormIntervencionSituacion = inject(NZ_MODAL_DATA);

  create: boolean = this.dataIntervencionSituacion.create
  intervencion: IntervencionResponse = this.dataIntervencionSituacion.intervencion

  fasesActual = signal<IntervencionFaseResponse[]>([])
  etapasActual = signal<IntervencionEtapaResponse[]>([])
  hitosActual = signal<IntervencionHitoResponse[]>([])

  pagination: Pagination = { 
    columnSort: 'nombre',
    typeSort: 'ASC',
    pageSize: 100,
    currentPage: 1
  }

  private fb = inject(FormBuilder)
  private intervencionFaseService = inject(IntervencionFaseService)
  private intervencionEtapaService = inject(IntervencionEtapaService)
  private intervencionHitoService = inject(IntervencionHitoService)

  formIntervencionSituacion: FormGroup = this.fb.group({
    situacion: [ '', Validators.required ],
    fecha: [ '', Validators.required ],
    intervencionFaseActualId: [ '', Validators.required ],
    intervencionEtapaActualId: [ '', Validators.required ],
    intervencionHitoActualId: [ '', Validators.required ],
  })

  ngOnInit(): void {
    this.obtenerIntervencionFaseService()
  }

  alertMessageError(control: string) {
    return this.formIntervencionSituacion.get(control)?.errors && this.formIntervencionSituacion.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formIntervencionSituacion.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  obtenerIntervencionFaseService(){
    this.intervencionFaseService.ListarIntervencionFases(this.pagination).subscribe( resp => this.fasesActual.set(resp.data.filter(item => Number(item.tipoIntervencion) == 1 )) )
  }

  obtenerFase(){
    const intervencionFaseId = this.formIntervencionSituacion.get('intervencionFaseActualId')?.value
    const intervencionEtapaControl = this.formIntervencionSituacion.get('intervencionEtapaActualId')
    const intervencionHitoControl = this.formIntervencionSituacion.get('intervencionHitoActualId')
    if(intervencionFaseId){
      intervencionEtapaControl?.enable()
      this.obtenerIntervencionEtapaService()
    } else {
      intervencionEtapaControl?.reset()
      intervencionEtapaControl?.disable()
    }
    intervencionHitoControl?.disable()
    intervencionHitoControl?.reset()
  }

  obtenerIntervencionEtapaService(){
    const faseId = this.formIntervencionSituacion.get('intervencionFaseActualId')?.value
    this.intervencionEtapaService.ListarIntervencionEtapas({...this.pagination, faseId}).subscribe( resp => this.etapasActual.set(resp.data))
  }

  obtenerEtapa(){    
    const intervencionEtapaId = this.formIntervencionSituacion.get('intervencionEtapaActualId')?.value
    const intervencionHitoControl = this.formIntervencionSituacion.get('intervencionHitoActualId')
      intervencionHitoControl?.reset()
    if(intervencionEtapaId){
      intervencionHitoControl?.enable()
      this.obtenerIntervencionHitoService()
    } else {
      intervencionHitoControl?.disable()
    }
  }

  obtenerIntervencionHitoService(){
    const etapaId = this.formIntervencionSituacion.get('intervencionEtapaActualId')?.value 
    this.intervencionHitoService.ListarIntervencionHitos({...this.pagination, etapaId }).subscribe( resp => this.hitosActual.set(resp.data))
  }
}
