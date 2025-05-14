import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { DataModalInversionTarea, EntidadResponse, InversionTareaResponse, Pagination, SectorResponse } from '@core/interfaces';
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

  sectorEntidad: boolean = false
  cantidadCaracteresTarea = 1500

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
    entidadId: [{ value: '', disabled: false }, Validators.required],
    inversionHitoId: [ '', Validators.required ],
    responsableId: [ '', Validators.required ]
  })

  ngOnInit(): void {
    this.obtenerResponsables()
    this.obtenerSectoresService()
  }

  obtenerResponsables(){
    this.sectoresServices.getAllSectors(0,4).subscribe( resp => this.responsables.set(resp.data))
  }

  obtenerSectoresService(){
    this.sectoresServices.getAllSectors().subscribe( resp => this.sectores.set(resp.data))
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
    const responsable = this.responsables().find( item => item.grupoID == responsableValue )
    if(responsable?.nombre == 'GN'){
      console.log('SECTORES');
      // const sectorId = this.inversionTarea().se
    } else {
      console.log('UBIGEO');
    }
    console.log(this.responsables());
    console.log(responsable);
    console.log();
    

    
  }

  obtenerSector(){
    const sectorId = this.formInversionTarea.get('sectorId')?.value
    const entidadControl = this.formInversionTarea.get('entidadId')
    if(sectorId){
      entidadControl?.enable()
      this.obtenerEntidadSector()
    } else {
      entidadControl?.reset()
      this.sectorEntidades.set([])
      entidadControl?.disable()
    }
  }

  obtenerEntidadSector(){
    const sectorId = this.formInversionTarea.get('sectorId')?.value    
    const paginationEntidadSector: Pagination = {
      entidadId: 0,
      tipo: '1',
      sectorId
    }
    this.entidadServices.listarEntidades(paginationEntidadSector)
      .subscribe( resp => {
        console.log(resp);
        this.sectorEntidades.set(resp.data)
      })
  }
}
