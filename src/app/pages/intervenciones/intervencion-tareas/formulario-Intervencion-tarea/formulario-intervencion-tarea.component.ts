import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { convertDateStringToDate, typeErrorControl } from '@core/helpers';
import { DataModalIntervencionTarea, EntidadResponse, IntervencionEspacioResponse, IntervencionEtapaResponse, IntervencionFaseResponse, IntervencionHitoResponse, IntervencionTareaResponse, MesaIntegranteResponse, Pagination, SectorResponse } from '@core/interfaces';
import { EntidadesService, IntervencionEtapaService, IntervencionFaseService, IntervencionHitoService, MesaIntegrantesService, SectoresService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-intervencion-tarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule],
  templateUrl: './formulario-intervencion-tarea.component.html',
  styles: ``
})
export class FormularioIntervencionTareaComponent {
  readonly dataIntervencionTarea: DataModalIntervencionTarea = inject(NZ_MODAL_DATA);

  create: boolean = this.dataIntervencionTarea.create
  sectorEntidad: boolean = false
  cantidadCaracteresTarea = 1500

  pagination: Pagination = {
    columnSort: 'nombre',
    typeSort: 'ASC',
    pageSize: 100,
    currentPage: 1
  }

  intervencionEspacio = signal<IntervencionEspacioResponse>(this.dataIntervencionTarea.intervencionEspacio)
  intervencionTarea = signal<IntervencionTareaResponse>(this.dataIntervencionTarea.intervencionTarea)
  responsables = signal<SectorResponse[]>([])
  sectores = signal<SectorResponse[]>([])
  sectorEntidades = signal<EntidadResponse[]>([])
  mesaIntegrantes = signal<MesaIntegranteResponse[]>([])
  intervencionFases = signal<IntervencionFaseResponse[]>([])
  intervencionEtapas = signal<IntervencionEtapaResponse[]>([])
  intervencionHitos = signal<IntervencionHitoResponse[]>([])

  private fb = inject(FormBuilder)
  private sectoresServices = inject(SectoresService)
  private entidadServices = inject(EntidadesService)
  private intervencionFaseService = inject(IntervencionFaseService)
  private intervencionEtapaService = inject(IntervencionEtapaService)
  private intervencionHitoService = inject(IntervencionHitoService)
  private mesaIntegrantesService = inject(MesaIntegrantesService)

  formIntervencionTarea: FormGroup = this.fb.group({
    tarea: [ '', Validators.required ],
    plazo: [ '', Validators.required ],
    entidadId: [{ value: '', disabled: true }, Validators.required],
    entidad: [{ value: '', disabled: true }],
    responsableId: [ null, Validators.required ],
    intervencionFaseId: [ null, Validators.required ],
    intervencionEtapaId: [{ value: null, disabled: true }, Validators.required],
    intervencionHitoId: [{ value: null, disabled: true }, Validators.required],
    comentario: [ '' ],
    comentarioSd: [ '' ],
    validado: [ false, Validators.required ],
  })

  ngOnInit(): void {
    const plazo = this.create ? '' :  convertDateStringToDate(this.intervencionTarea().plazo)
    this.formIntervencionTarea.reset({...this.intervencionTarea(), plazo })
    this.obtenerResponsablesService()
    this.obtenerEntidadSector()
    this.obtenerIntervencionOrigen()
    this.obtenerIntervencionFaseService()
    this.setForm()
  }

  setForm(){
    if(!this.create){
      const etapaIdControl = this.formIntervencionTarea.get('intervencionEtapaId')
      const hitoIdControl = this.formIntervencionTarea.get('intervencionHitoId')
      etapaIdControl?.enable()
      hitoIdControl?.enable()

      this.sectorEntidad = this.intervencionTarea().responsable == 'GN'
      if(this.sectorEntidad){
        // this.formIntervencionTarea.get('entidadId')?.enable()
      }
      this.formIntervencionTarea.get('entidadId')?.enable()
      
      this.obtenerIntervencionEtapaService()
      this.obtenerIntervencionHitoService()
    }
  }

  obtenerResponsablesService(){
    this.sectoresServices.getAllSectors(0,4)
      .subscribe( resp => {        
        let responsable = resp.data.length == 0 ? [] : resp.data.filter(item => item.grupoID != '0')      
        this.responsables.set(responsable)
    })
  }

  obtenerEntidadSector(){
    const sectorId = Number(this.intervencionEspacio().sectorId)
    const pagination: Pagination = { ...this.pagination, sectorId, columnSort: 'entidadId' }
    this.entidadServices.listarEntidades(pagination).subscribe( resp => this.sectorEntidades.set(resp.data) )
  }

  obtenerIntervencionOrigen(){
    const origen = this.intervencionEspacio().origen
    const interaccionId = this.intervencionEspacio().interaccionId
    if(origen.toLowerCase() === 'mesas'){
      this.obtenerUbigeoEntidadMesa(interaccionId)
    }
  }

  obtenerUbigeoEntidadMesa(mesaId: string){
    const pagination: Pagination = {...this.pagination, columnSort: 'mesaIntegranteId', typeSort: 'DESC', pageSize: 100, esSector: '0'}
    this.mesaIntegrantesService.ListarMesaIntegrantes(mesaId, pagination).subscribe( resp => this.mesaIntegrantes.set(resp.data))
  }

  obtenerIntervencionFaseService(){
    this.intervencionFaseService.ListarIntervencionFases(this.pagination).subscribe( resp => this.intervencionFases.set(resp.data.filter( item => item.tipoIntervencion == this.intervencionEspacio().tipoIntervencion && item.intervencionFaseId! >= this.intervencionEspacio().inicioIntervencionFaseId! )))
  }

  alertMessageError(control: string) {
    return this.formIntervencionTarea.get(control)?.errors && this.formIntervencionTarea.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formIntervencionTarea.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  caracteresContador(qty: number) {
    const element = this.formIntervencionTarea.get('tarea')
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
    const responsableValue = this.formIntervencionTarea.get('responsableId')?.value
    const entidadIdControl = this.formIntervencionTarea.get('entidadId')
    const entidadControl = this.formIntervencionTarea.get('entidad')
    const responsable = this.responsables().find( item => item.grupoID == responsableValue )
    this.sectorEntidad = responsable!.nombre == 'GN'  

    // responsableValue && this.sectorEntidad ? entidadIdControl?.enable() :entidadIdControl?.disable()

    entidadIdControl?.enable()
    entidadControl?.reset()
    entidadIdControl?.reset()

    // if(this.sectorEntidad){
    //   entidadControl?.reset()
    //   entidadIdControl?.reset()
    // } else {
    //   entidadControl?.setValue(this.intervencionEspacio().entidad)
    //   entidadIdControl?.setValue(this.intervencionEspacio().entidadUbigeoId)
    // }
  }

  obtenerEntidadId(){
    const entidadIdControl = this.formIntervencionTarea.get('entidadId')
    const entidadControl = this.formIntervencionTarea.get('entidad')
    const entidadIdValue = entidadIdControl?.value
    
    if(this.sectorEntidad){
      const entidad = this.sectorEntidades().find( item => item.entidadId == entidadIdValue)
      entidadControl?.setValue(entidad?.nombre)
    } else {
      const entidad = this.mesaIntegrantes().find( item => item.entidadId == entidadIdValue )
      entidadControl?.setValue(entidad?.entidad)
    }
    // if(entidadIdValue){
    //   const entidad = this.sectorEntidades().find( item => item.entidadId == entidadIdValue)
    //   entidadControl?.setValue(entidad?.nombre)
    // }
  }

  obtenerIntervencionEtapa(){
    const intervencionFaseId = this.formIntervencionTarea.get('intervencionFaseId')?.value
    const intervencionEtapaControl = this.formIntervencionTarea.get('intervencionEtapaId')
    const intervencionHitoControl = this.formIntervencionTarea.get('intervencionHitoId')

    if(intervencionFaseId){
      intervencionEtapaControl?.enable()
      intervencionEtapaControl?.reset()
      this.obtenerIntervencionEtapaService()
    } else {
      intervencionEtapaControl?.disable()
    }
    intervencionHitoControl?.disable()
    intervencionHitoControl?.reset()
  }

  obtenerIntervencionEtapaService(){
    const faseId = this.formIntervencionTarea.get('intervencionFaseId')?.value
    this.intervencionEtapaService.ListarIntervencionEtapas({...this.pagination, faseId}).subscribe( resp => this.intervencionEtapas.set(resp.data.filter( item => item.intervencionEtapaId! >= this.intervencionEspacio().inicioIntervencionEtapaId! )))
  }

  obtenerIntervencionHito(){
    const intervencionEtapaId = this.formIntervencionTarea.get('intervencionEtapaId')?.value
    const intervencionHitoControl = this.formIntervencionTarea.get('intervencionHitoId')
      intervencionHitoControl?.reset()
    if(intervencionEtapaId){
      intervencionHitoControl?.enable()
      this.obtenerIntervencionHitoService()
    } else {
      intervencionHitoControl?.disable()
    }
  }

  obtenerIntervencionHitoService(){
    const etapaId = this.formIntervencionTarea.get('intervencionEtapaId')?.value    
    this.intervencionHitoService.ListarIntervencionHitos({...this.pagination, etapaId }).subscribe( resp => this.intervencionHitos.set(resp.data.filter( item => item.intervencionHitoId! >= this.intervencionEspacio().inicioIntervencionHitoId! )))
  }
}
