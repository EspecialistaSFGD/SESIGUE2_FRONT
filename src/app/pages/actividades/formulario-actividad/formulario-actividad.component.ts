import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { ActividadResponse, DataModalActividad, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { UbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-actividad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule],
  templateUrl: './formulario-actividad.component.html',
  styles: ``
})
export class FormularioActividadComponent {
  readonly dataActividad: DataModalActividad = inject(NZ_MODAL_DATA);
  
  create: boolean = this.dataActividad.create
  actividad = signal<ActividadResponse>(this.dataActividad.actividad)

  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[][]>([])
  distritos = signal<UbigeoDistritoResponse[][]>([])

  private fb = inject(FormBuilder)
  private ubigeosService = inject(UbigeosService)

  formActividad: FormGroup = this.fb.group({
    entidadId: ['', Validators.required],
    departamento: [null, Validators.required],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }],
    direccion: ['', Validators.required],
    latitud: ['', Validators.required],
    longitud: ['', Validators.required],
    distancia: ['', Validators.required],
  })

  ngOnInit(): void {
    this.obtenerDepartamentoService()
  }

  alertMessageError(control: string) {
    return this.formActividad.get(control)?.errors && this.formActividad.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formActividad.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  obtenerDepartamentoService(){
    this.ubigeosService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
  }

  changeDepartamento(){
    const ControlDepartamento = this.formActividad.get('departamento')
  }

  changeProvincia(){
    const ControlProvincia = this.formActividad.get('provincia')
  }

  changeDistrito(){
    const ControlDistrito = this.formActividad.get('distrito')
  }
}
