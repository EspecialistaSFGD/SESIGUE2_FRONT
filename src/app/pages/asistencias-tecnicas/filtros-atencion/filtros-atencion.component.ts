import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { capitalize, convertDateStringToDate, getDateFormat } from '@core/helpers';
import { EventoResponse, ItemEnum, Pagination, SectorResponse, TipoEntidadResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EventosService, SectoresService, TipoEntidadesService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-filtros-atencion',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './filtros-atencion.component.html',
  styles: ``
})
export class FiltrosAtencionComponent {
  @Input() tipos!: ItemEnum[]
  @Input() permisosPCM: boolean = false


  @Input() visible: boolean = false
  @Input() pagination: any = {}

  @Output() filters = new EventEmitter<Pagination>();
  @Output() visibleDrawer = new EventEmitter()
  @Output() save = new EventEmitter<boolean>()
  @Output() export = new EventEmitter<boolean>()
  
  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  public eventos = signal<EventoResponse[]>([])
  sectores = signal<SectorResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private fb = inject(FormBuilder)
  private tipoEntidadService = inject(TipoEntidadesService)
  private eventosService = inject(EventosService)
  private sectoresService = inject(SectoresService)
  private validatorsService = inject(ValidatorService)
  private ubigeosService = inject(UbigeosService)

  private timeout: any;

  formFilters: FormGroup = this.fb.group({
    codigo: [null],
    fechaInicio: [null],
    fechaFin: [null],
    tipoEntidad: [null],
    tipos: [[]],
    ubigeo: [null],
    departamento: [null],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }],
    sectorId: [null],
    eventoId: [null],
    unidadOrganica: [''],
    especialista: [''],
  })

  ngOnChanges(changes: SimpleChanges): void {
    const pagination = { ...this.pagination }
    const eventoId = pagination.eventoId ? Number(pagination.eventoId) : null
    const sectorId = pagination.sectorId ? Number(pagination.sectorId) : null
    const fechaInicio = pagination.fechaInicio ? convertDateStringToDate(pagination.fechaInicio) : null
    const fechaFin = pagination.fechaFin ? convertDateStringToDate(pagination.fechaFin) : null

    const ubigeo = this.pagination.ubigeo
    const ubigeoLen = ubigeo ? ubigeo.length : 0
    const departamento = ubigeo && ubigeoLen >= 2 ? ubigeo.slice(0,2) : null
    const provincia = ubigeo && ubigeoLen >= 4 ? `${ubigeo.slice(0,4)}01` : null
    const distrito = ubigeo && ubigeoLen == 6 ? ubigeo : null
    
    this.formFilters.reset({...pagination, eventoId, fechaInicio, fechaFin, sectorId, departamento, provincia, distrito})
    this.getFormUbigeoService()
    this.setTipoAtencion()
    this.getAllTipoEntidades()
    this.obtenerServiciosEventos()
    this.obtenerServicioSectores()
    this.obtenerDepartamentoService()
  }

  getFormUbigeoService(){
    const ubigeo = this.pagination.ubigeo
    if(ubigeo){
      const ubigeoLen = ubigeo.length
      if(ubigeoLen >= 2){
        this.obtenerProvinciaService(ubigeo.slice(0,2))
      } 
      if(ubigeoLen >= 4) {
        this.setControlEnable('provincia')
        this.setControlEnable('distrito')
        this.obtenerDistritosService(ubigeo.slice(0,4))
      }
      if(ubigeoLen == 6) {
        this.setControlEnable('distrito')
      }
    }
  }

  setControlEnable(control:string, enable: boolean = true){
    const formControl = this.formFilters.get(control)
    enable ? formControl?.enable() : formControl?.disable()
  }

  setTipoAtencion(){
    const newTipos: ItemEnum[] = []
    this.tipos.filter( item => {
      newTipos.push({ value: item.value.toLowerCase(), text: capitalize(item.text)! })
    })
    this.tipos = newTipos.filter( item => this.permisosPCM ? item.value.toLowerCase() != 'atencion' :  item.value.toLowerCase() == 'atencion' )
  }
  
  getAllTipoEntidades() {    
    this.tipoEntidadService.getAllTipoEntidades({...this.pagination, columnSort: 'nombre'}).subscribe(resp => this.tipoEntidades.set(resp.data))
  }

  obtenerServiciosEventos() {
    const vigenteId = this.permisosPCM ? [2,3,4] : [2,3]
    const tipoEvento = this.permisosPCM ? [8,9] : [8]
    this.eventosService.getAllEventos(tipoEvento, 1, vigenteId, {...this.pagination, columnSort: 'eventoId', pageSize: 100, typeSort: 'DESC'})
      .subscribe(resp => {
        this.eventos.set(resp.data)
      })
  }

  obtenerServicioSectores() {
    this.sectoresService.getAllSectors().subscribe(resp => this.sectores.set(resp.data))
  }

  changeControl(event: any, control:string){
    const codigoControl = this.formFilters.get(control)
    const codigoValue = codigoControl?.value

    const nameControl = control as keyof Pagination;
    if(codigoValue){
      clearTimeout(this.timeout);
      var $this = this;
      this.timeout = setTimeout(function () {
        if ($this.validatorsService.codigoPattern.test(event.key) || event.key === 'Backspace' || event.key === 'Delete' || codigoValue.length > 0) {          
          $this.pagination[nameControl] = codigoValue          
          $this.generateFilters()
        }
      }, 500);      
    } else {
      codigoControl?.patchValue(null)
      delete this.pagination[nameControl]      
      this.generateFilters()
    }
  }

  changefechaInicio(){
    const fechaInicioValue = this.formFilters.get('fechaInicio')?.value

    if(fechaInicioValue){      
    } else {
      delete this.pagination.fechaInicio
    }
    this.generateFilters()
  }
    
  changeFechaFin(){
    const fechaFinValue = this.formFilters.get('fechaFin')?.value
    if(fechaFinValue){
    } else {
      delete this.pagination.fechaFin
    }      
    this.generateFilters()
  }

  changeEvento(){
    const eventoValue = this.formFilters.get('eventoId')?.value

    if(eventoValue){
      const evento = this.eventos().find(e => e.eventoId === eventoValue)

      const fechaInicioControl = this.formFilters.get('fechaInicio')
      const fechaFinControl = this.formFilters.get('fechaFin')
      const sectorControl = this.formFilters.get('sectorId')
      evento?.abreviatura.toLowerCase() == 'poi' ? fechaInicioControl?.enable() : fechaInicioControl?.disable()
      evento?.abreviatura.toLowerCase() == 'poi' ? fechaFinControl?.enable() : fechaFinControl?.disable()
      evento?.abreviatura.toLowerCase() == 'poi' ? fechaInicioControl?.setValue(fechaInicioControl?.value) : fechaInicioControl?.setValue(null)
      evento?.abreviatura.toLowerCase() == 'poi' ? fechaFinControl?.setValue(fechaFinControl?.value) : fechaFinControl?.setValue(null)
      evento?.abreviatura.toLowerCase() == 'poi' ? sectorControl?.disable() : sectorControl?.enable()
      evento?.abreviatura.toLowerCase() == 'poi' ? sectorControl?.setValue(null) : sectorControl?.setValue(sectorControl?.value)
      if(evento?.abreviatura.toLowerCase() != 'poi'){
        delete this.pagination.fechaInicio
        delete this.pagination.fechaFin
      } else {
        delete this.pagination.sectorId
      }

      this.pagination.eventoId = eventoValue
    } else {
      delete this.pagination.eventoId
    }
    
    this.generateFilters()
  }

  changeSector(){
    const sectorValue = this.formFilters.get('sectorId')?.value
    if(sectorValue){
      this.pagination.sectorId = sectorValue
    } else {
      delete this.pagination.sectorId
    }
    
    this.generateFilters()
  }

  obtenerDepartamentoService(){
    this.ubigeosService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
  }

  changeTipoAtencion(){
    this.generateFilters()
  }

  changeDepartamento(){
    const ubigeoControl = this.formFilters.get('ubigeo')
    const departamentoControl = this.formFilters.get('departamento')
    const departamento = departamentoControl?.value
    const provinciaControl = this.formFilters.get('provincia')
    const distritoControl = this.formFilters.get('distrito')
    if(departamento){
      this.obtenerProvinciaService(departamento)
      ubigeoControl?.setValue(departamento)
      provinciaControl?.enable()
    } else {
      ubigeoControl?.reset()
      provinciaControl?.enable()
      provinciaControl?.reset()
      delete this.pagination.ubigeo
    }
    distritoControl?.disable()
    distritoControl?.reset()
    this.generateFilters()
  }

  obtenerProvinciaService(departamento: string){
    this.ubigeosService.getProvinces(departamento).subscribe( resp => this.provincias.set(resp.data))
  }

  changeProvincia(){
    const ubigeoControl = this.formFilters.get('ubigeo')
    const departamentoControl = this.formFilters.get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = this.formFilters.get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = this.formFilters.get('distrito')
    let ubigeo = departamentoValue
    if(provinciaValue){
      ubigeo = provinciaValue.slice(0,4)
      this.obtenerDistritosService(`${ubigeo}01`)
      distritoControl?.enable()
    } else {
      distritoControl?.disable()
    }
    ubigeoControl?.setValue(ubigeo)
    distritoControl?.reset()
    this.generateFilters()
  }

  obtenerDistritosService(provincia: string){    
    this.ubigeosService.getDistricts(provincia) .subscribe( resp => this.distritos.set(resp.data))
  }

  changeDistrito(){
    const ubigeoControl = this.formFilters.get('ubigeo')
    const provinciaControl = this.formFilters.get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = this.formFilters.get('distrito')
    const distritoValue = distritoControl?.value

    let ubigeo = distritoValue ? distritoValue : provinciaValue.slice(0,4)
    ubigeoControl?.setValue(ubigeo)
    this.generateFilters()
  }

  generateFilters(){
    const fechaInicioControl = this.formFilters.get('fechaInicio')
    const fechaFinControl = this.formFilters.get('fechaFin')

    const fechaInicio = fechaInicioControl?.value ? getDateFormat(fechaInicioControl?.value) : null
    const fechaFin = fechaFinControl?.value ? getDateFormat(fechaFinControl?.value) : null

    const formValue = { ...this.formFilters.value }  

    this.filters.emit({...formValue, fechaInicio, fechaFin })
  }

  cleanParams(){
    localStorage.removeItem('filtrosAtenciones');
    this.formFilters.reset()
    this.generateFilters()
    this.changeVisibleDrawer(false,false)
  }

  changeVisibleDrawer(visible: boolean, save: boolean = true){
    this.save.emit(save) 
    this.visibleDrawer.emit(visible)
  }

  changeExport(){
    this.changeVisibleDrawer(false)
    this.export.emit(true)
  }
}
