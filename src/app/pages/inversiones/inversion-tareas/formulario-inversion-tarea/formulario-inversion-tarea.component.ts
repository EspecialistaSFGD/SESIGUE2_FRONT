import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { DataModalInversionTarea, EntidadResponse, InversionEspacioResponse, InversionTareaResponse, Pagination, SectorResponse } from '@core/interfaces';
import { EntidadesService, SectoresService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-inversion-tarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './formulario-inversion-tarea.component.html',
  styles: ``
})
export class FormularioInversionTareaComponent {
  readonly dataInversionTarea: DataModalInversionTarea = inject(NZ_MODAL_DATA);

  create: boolean = this.dataInversionTarea.create
  sectorEntidad: boolean = false
  cantidadCaracteresTarea = 1500

  inversionEspacio = signal<InversionEspacioResponse>(this.dataInversionTarea.inversionEspacio)
  inversionTarea = signal<InversionTareaResponse>(this.dataInversionTarea.inversionTarea)
  responsables = signal<SectorResponse[]>([])
  sectores = signal<SectorResponse[]>([])
  sectorEntidades = signal<EntidadResponse[]>([])

  private fb = inject(FormBuilder)
  private sectoresServices = inject(SectoresService)
  private entidadServices = inject(EntidadesService)

  formInversionTarea: FormGroup = this.fb.group({
    tarea: [ '', Validators.required ],
    plazo: [ '', Validators.required ],
    entidadId: [{ value: '', disabled: true }, Validators.required],
    entidad: [{ value: '', disabled: true }],
    inversionHitoId: [ '', Validators.required ],
    responsableId: [ '', Validators.required ]
  })

  ngOnInit(): void {
    const entidad = this.create ? null : this.inversionEspacio().entidad
    this.formInversionTarea.reset({...this.inversionTarea, entidad })
    this.obtenerResponsables()
    this.obtenerEntidadSector()
  }

  obtenerResponsables(){
    this.sectoresServices.getAllSectors(0,4).subscribe( resp => this.responsables.set(resp.data))
  }

  alertMessageError(control: string) {
    return this.formInversionTarea.get(control)?.errors && this.formInversionTarea.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formInversionTarea.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  caracteresContador(qty: number) {
    const element = this.formInversionTarea.get('tarea')
    const value = element?.value    
    if(value){
      if (value.length > qty) {
        const newValue = value.substring(0, qty);
        element?.setValue(newValue)
      }
      this.cantidadCaracteresTarea = qty - value.length;
    }
  }

  obtenerResponsable(){
    const responsableValue = this.formInversionTarea.get('responsableId')?.value
    const entidadIdControl = this.formInversionTarea.get('entidadId')
    const entidadControl = this.formInversionTarea.get('entidad')
    const responsable = this.responsables().find( item => item.grupoID == responsableValue )
    this.sectorEntidad = responsable!.nombre == 'GN'

    responsableValue > 0 && this.sectorEntidad ? entidadIdControl?.enable() :entidadIdControl?.disable()

    if(this.create && !this.sectorEntidad){
      entidadControl?.setValue(this.inversionEspacio().entidad)
      entidadIdControl?.setValue(this.inversionEspacio().entidadUbigeoId)
    }
    if(responsableValue == 0){
      entidadControl?.reset()
      entidadIdControl?.reset()
    }
  }

  obtenerEntidadSector(){
    const sectorId = Number(this.inversionEspacio().sectorId)
    const paginationEntidadSector: Pagination = {
      entidadId: 0,
      tipo: '1',
      sectorId
    }
    this.entidadServices.listarEntidades(paginationEntidadSector).subscribe( resp => this.sectorEntidades.set(resp.data) )
  }
}
