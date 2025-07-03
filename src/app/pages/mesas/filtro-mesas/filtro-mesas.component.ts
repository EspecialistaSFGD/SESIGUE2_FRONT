import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EntidadResponse, Pagination, SectorResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, SectoresService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-filtro-mesas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule, PrimeNgModule],
  templateUrl: './filtro-mesas.component.html',
  styles: ``
})
export class FiltroMesasComponent {
  @Input() visible: boolean = false
  @Input() pagination: any = {}
  
  @Output() visibleDrawer = new EventEmitter()
  @Output() filters = new EventEmitter<Pagination>()
  @Output() save = new EventEmitter<boolean>()
  @Output() export = new EventEmitter<boolean>()

  private timeout: any;

  sectores = signal<SectorResponse[]>([])
  secreatariaTecnicas = signal<EntidadResponse[]>([])
  entidades = signal<EntidadResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])
  
  private fb = inject(FormBuilder)
  private sectoresService = inject(SectoresService)
  private entidadesService = inject(EntidadesService)
  private ubigeosService = inject(UbigeosService)
  private validatorsService = inject(ValidatorService)

  formFilters: FormGroup = this.fb.group({
    codigo: [null],
    nombre: [null],
    sectorId: [null],
    secretariaTecnicaId: [{ value: null, disabled: true }],
    sectorEntidadId: [null],
    entidadId: [{ value: null, disabled: true }],
    departamento: [null],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }],
    entidadUbigeoId: [null],
    ubigeo: [null]
  })

  // ngOnInit(): void {
  //   this.setParamsFilters()
  // }
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.setParamsFilters()
  }
  
  setParamsFilters(){
    const pagination = { ...this.pagination }
    const codigo = pagination.codigo ? pagination.codigo.toUpperCase() : null
    const nombre = pagination.nombre ? pagination.nombre : null
    const sectorId = pagination.sectorId ? Number(pagination.sectorId) : null
    const secretariaTecnicaId = pagination.secretariaTecnicaId ? Number(pagination.secretariaTecnicaId) : null
    const sectorEntidadId = pagination.sectorEntidadId ? Number(pagination.sectorEntidadId) : null
    const entidadId = pagination.entidadId ? Number(pagination.entidadId) : null
    const ubigeo = pagination.ubigeo ? pagination.ubigeo : null
    
    this.formFilters.reset({  ... pagination, codigo, nombre, sectorId, secretariaTecnicaId, sectorEntidadId, entidadId })
    this.obtenerSectoresServicio()
    this.obtenerDepartamentoService()

    if(sectorId){
      this.formFilters.get('secretariaTecnicaId')?.enable()
      this.obtenerSecreatriaTecnicaService(sectorId)
    }

    if(sectorEntidadId){
      this.formFilters.get('entidadId')?.enable()
      this.obtenerEntidadesService(sectorEntidadId)
    }

    if(ubigeo){
      const departamentoUbigeo = ubigeo.slice(0,2)      
      this.formFilters.get('departamento')?.setValue(departamentoUbigeo)
      const provinciaControl = this.formFilters.get('provincia')
      provinciaControl?.enable()
      this.obtenerProvinciaService(departamentoUbigeo)

      const restUbigeo = ubigeo.slice(2,6)
      if(restUbigeo !== '0000'){
        const ubigeoDistrito = ubigeo.slice(0,4)
        provinciaControl?.setValue(`${ubigeoDistrito}01`)

        this.obtenerDistritosService(ubigeo)        
        const distritoControl = this.formFilters.get('distrito')
        distritoControl?.enable()

        const lastUbigeo = ubigeo.slice(4,6)
        if(lastUbigeo !== '01'){
          distritoControl?.setValue(ubigeo)
        }
      }
      
    }
  }

  generarReporte(){
    this.export.emit(true)
    this.changeVisibleDrawer(false)
  }

  cleanParamsMesas(){
    localStorage.removeItem('filtrosMesas');
    this.formFilters.reset()
    this.generateFilters()
    this.changeVisibleDrawer(false)
  }

  changeVisibleDrawer(visible: boolean, save: boolean = true){   
    this.save.emit(save) 
    this.visibleDrawer.emit(visible)
  }

  obtenerSectoresServicio() {
    this.sectoresService.getAllSectors().subscribe(resp => { this.sectores.set(resp.data.filter(item =>  item.grupoID != '0')) })
  }

  obtenerDepartamentoService(){
    this.ubigeosService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
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
      delete this.pagination[nameControl]
      this.generateFilters()
    }
  }

  obtenerSecretaria(){
    const sectorValue = this.formFilters.get('sectorId')?.value
    const secretariaTecnicaIdControl = this.formFilters.get('secretariaTecnicaId')
    if(sectorValue){
      secretariaTecnicaIdControl?.enable()
      this.obtenerSecreatriaTecnicaService(sectorValue)
    } else {
      secretariaTecnicaIdControl?.disable()
      secretariaTecnicaIdControl?.reset()
    }
    this.generateFilters()
  }

  obtenerSecreatriaTecnicaService(sectorId: number){
    const pagination: Pagination = { sectorId, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.entidadesService.listarEntidades(pagination).subscribe( resp => this.secreatariaTecnicas.set(resp.data))
  }

  changeSector(){
    const sectorValue = this.formFilters.get('sectorEntidadId')?.value
    const entidadIdControl = this.formFilters.get('entidadId')
    if(sectorValue){
      entidadIdControl?.enable()
      this.obtenerEntidadesService(sectorValue)
    } else {
      entidadIdControl?.disable()
    }
    entidadIdControl?.reset()
    this.generateFilters()
  }

  obtenerEntidadesService(sectorId: number){
    const pagination: Pagination = { sectorId, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.entidadesService.listarEntidades(pagination).subscribe( resp => this.entidades.set(resp.data))
  }

  changeDepartamento(){
    const departamentoControl = this.formFilters.get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = this.formFilters.get('provincia')
    const distritoControl = this.formFilters.get('distrito')
    const ubigeoControl = this.formFilters.get('ubigeo')
    const entidadUbigeoIdControl = this.formFilters.get('entidadUbigeoId')
    let ubigeo = null 
    if(departamentoValue){
      ubigeo = `${departamentoValue}0000`
      provinciaControl?.enable()
      this.obtenerProvinciaService(departamentoValue)
      this.obtenerEntidadUbigeoService(ubigeo) 
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
      entidadUbigeoIdControl?.reset()
    }
    ubigeoControl?.setValue(ubigeo)
    distritoControl?.disable()
    distritoControl?.reset()
    this.filterUbigeoTime()    
  }

  obtenerProvinciaService(departamento: string){
    this.ubigeosService.getProvinces(departamento).subscribe( resp => this.provincias.set(resp.data))
  }

  obtenerEntidadUbigeoService(ubigeo: string){
      const entidadUbigeoIdControl = this.formFilters.get('entidadUbigeoId')
      const pagination: Pagination = { ubigeo, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
      this.entidadesService.listarEntidades(pagination)
        .subscribe( resp => {
          const entidad = resp.data[0]
          entidadUbigeoIdControl?.setValue(entidad ? entidad.entidadId : null)
        })
    }

  changeProvincia(){
    const departamentoControl = this.formFilters.get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = this.formFilters.get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = this.formFilters.get('distrito')
    const ubigeoControl = this.formFilters.get('ubigeo')
   
    let ubigeo = `${departamentoValue}0000`
    if(provinciaValue){
      distritoControl?.enable()
      ubigeo = provinciaValue
      this.obtenerDistritosService(ubigeo)
    } else {
      distritoControl?.disable()
      distritoControl?.reset()
    }
    ubigeoControl?.setValue(ubigeo)
    this.obtenerEntidadUbigeoService(ubigeo)
    this.filterUbigeoTime()    
  }

  obtenerDistritosService(provincia: string){
    this.ubigeosService.getDistricts(provincia) .subscribe( resp => this.distritos.set(resp.data))
  }

  changeDistrito(){
    const provinciaControl = this.formFilters.get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = this.formFilters.get('distrito')
    const ubigeoControl = this.formFilters.get('ubigeo')
    const distritoValue = distritoControl?.value

    let ubigeo = distritoValue ? distritoValue : provinciaValue
    ubigeoControl?.setValue(ubigeo)
    this.obtenerEntidadUbigeoService(ubigeo)
    this.filterUbigeoTime()
  }

  filterUbigeoTime(){
    setTimeout(() => {
      this.generateFilters()   
    }, 500);
  }

  generateFilters(){    
    this.pagination = { ...this.formFilters.value } 
    this.filters.emit(this.pagination)
  }
}
