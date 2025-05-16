import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { DataModalIntervencionTarea, EntidadResponse, IntervencionEspacioResponse, IntervencionEtapaResponse, IntervencionFaseResponse, IntervencionHitoResponse, IntervencionTareaResponse, Pagination, SectorResponse } from '@core/interfaces';
import { EntidadesService, IntervencionEtapaService, IntervencionFaseService, IntervencionHitoService, SectoresService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-inversion-tarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule],
  templateUrl: './formulario-inversion-tarea.component.html',
  styles: ``
})
export class FormularioInversionTareaComponent {
  readonly dataInversionTarea: DataModalIntervencionTarea = inject(NZ_MODAL_DATA);

  create: boolean = this.dataInversionTarea.create
  sectorEntidad: boolean = false
  cantidadCaracteresTarea = 1500

  paginationInversionData: Pagination = {
    columnSort: 'nombre',
    typeSort: 'ASC',
    pageSize: 100,
    currentPage: 1
  }

  inversionEspacio = signal<IntervencionEspacioResponse>(this.dataInversionTarea.intervencionEspacio)
  inversionTarea = signal<IntervencionTareaResponse>(this.dataInversionTarea.intervencionTarea)
  responsables = signal<SectorResponse[]>([])
  sectores = signal<SectorResponse[]>([])
  sectorEntidades = signal<EntidadResponse[]>([])
  inversionFases = signal<IntervencionFaseResponse[]>([])
  inversionEtapas = signal<IntervencionEtapaResponse[]>([])
  inversionHitos = signal<IntervencionHitoResponse[]>([])

  private fb = inject(FormBuilder)
  private sectoresServices = inject(SectoresService)
  private entidadServices = inject(EntidadesService)
  private inversionFaseService = inject(IntervencionFaseService)
  private inversionEtapaService = inject(IntervencionEtapaService)
  private inversionHitoService = inject(IntervencionHitoService)

  formInversionTarea: FormGroup = this.fb.group({
    tarea: [ '', Validators.required ],
    plazo: [ '', Validators.required ],
    entidadId: [{ value: '', disabled: true }, Validators.required],
    entidad: [{ value: '', disabled: true }],
    responsableId: [ '', Validators.required ],
    intervencionFaseId: [ '', Validators.required ],
    intervencionEtapaId: [{ value: '', disabled: true }, Validators.required],
    intervencionHitoId: [{ value: '', disabled: true }, Validators.required]
  })

  ngOnInit(): void {
    const entidad = this.create ? null : this.inversionEspacio().entidad
    this.formInversionTarea.reset({...this.inversionTarea, entidad })
    this.obtenerResponsables()
    this.obtenerEntidadSector()
    this.obtenerInversionFaseService()
  }

  obtenerResponsables(){
    this.sectoresServices.getAllSectors(0,4)
      .subscribe( resp => {
        let responsable = resp.data.length == 0 ? [] : resp.data.filter(item => item.grupoID != '0')      
        this.responsables.set(responsable)
    })
  }

  obtenerEntidadSector(){
    const sectorId = Number(this.inversionEspacio().sectorId)
    const paginationEntidadSector: Pagination = { entidadId: 0, tipo: '1', sectorId }
    this.entidadServices.listarEntidades(paginationEntidadSector).subscribe( resp => this.sectorEntidades.set(resp.data) )
  }

  obtenerInversionFaseService(){
    this.inversionFaseService.ListarIntervencionFases(this.paginationInversionData)
      .subscribe( resp => this.inversionFases.set(resp.data))
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

    responsableValue && this.sectorEntidad ? entidadIdControl?.enable() :entidadIdControl?.disable()

    if(this.create && !this.sectorEntidad){
      entidadControl?.setValue(this.inversionEspacio().entidad)
      entidadIdControl?.setValue(this.inversionEspacio().entidadUbigeoId)
    }
    if(this.sectorEntidad){
      entidadControl?.reset()
      entidadIdControl?.reset()
    }
  }

  obtenerInversionEtapa(){
    const intervencionFaseId = this.formInversionTarea.get('intervencionFaseId')?.value
    const inversionEtapaControl = this.formInversionTarea.get('intervencionEtapaId')
    const inversionHitoControl = this.formInversionTarea.get('intervencionHitoId')
    if(intervencionFaseId){
      inversionEtapaControl?.enable()
      inversionEtapaControl?.reset()
      this.obtenerInversionEtapaService()
    } else {
      inversionEtapaControl?.disable()
    }
    inversionHitoControl?.disable()
    inversionHitoControl?.reset()
  }

  obtenerInversionEtapaService(){
    const faseId = this.formInversionTarea.get('intervencionFaseId')?.value
    this.inversionEtapaService.ListarIntervencionEtapas({...this.paginationInversionData, faseId}).subscribe( resp => this.inversionEtapas.set(resp.data))
  }

  obtenerInversionHito(){
    const intervencionEtapaId = this.formInversionTarea.get('intervencionEtapaId')?.value
    const inversionHitoControl = this.formInversionTarea.get('intervencionHitoId')
      inversionHitoControl?.reset()
    if(intervencionEtapaId){
      inversionHitoControl?.enable()
      this.obtenerInversionHitoService()
    } else {
      inversionHitoControl?.disable()
    }
  }

  obtenerInversionHitoService(){
    const etapaId = this.formInversionTarea.get('intervencionEtapaId')?.value    
    this.inversionHitoService.ListarIntervencionHitos({...this.paginationInversionData, etapaId }).subscribe( resp => this.inversionHitos.set(resp.data))
  }
}
