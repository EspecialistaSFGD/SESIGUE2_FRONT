import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EntidadResponse, Pagination, SectorResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, SectoresService, UbigeosService } from '@core/services';
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
  @Input() pagination: Pagination = {}
  
  @Output() visibleDrawer = new EventEmitter()
  @Output() filters = new EventEmitter<Pagination>()
  @Output() export = new EventEmitter<boolean>()

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
    ubigeo: [null]
  })

  ngOnInit(): void {
    this.formFilters.reset(this.pagination)
    this.obtenerSectoresServicio()
    this.obtenerDepartamentoService()
  }

  changeVisibleDrawer(visible: boolean){
    this.visibleDrawer.emit(visible)
  }

  obtenerSectoresServicio() {
    this.sectoresService.getAllSectors().subscribe(resp => { this.sectores.set(resp.data.filter(item =>  item.grupoID != '0')) })
  }

  obtenerDepartamentoService(){
    this.ubigeosService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
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
      entidadIdControl?.reset()
    }
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
    let ubigeo = null 
    if(departamentoValue){
      ubigeo = `${departamentoValue}0000`
      provinciaControl?.enable()
      this.obtenerProvinciaService(departamentoValue)
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
    }
    ubigeoControl?.setValue(ubigeo)
    distritoControl?.disable()
    distritoControl?.reset() 
    this.generateFilters()   
  }

  obtenerProvinciaService(departamento: string){
    this.ubigeosService.getProvinces(departamento).subscribe( resp => this.provincias.set(resp.data))
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
    this.generateFilters()
    
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
    this.generateFilters()
  }

  generateFilters(){
    delete this.pagination.columnSort
    delete this.pagination.typeSort
    delete this.pagination.pageSize
    delete this.pagination.currentPage
    Object.keys(this.formFilters.controls).forEach(key => {
      const value = this.formFilters.get(key)?.value
      if (value !== null && value !== undefined && value !== '') {
        (this.pagination as any)[key] = value
      } else {
        delete (this.pagination as any)[key]
      }
    })
    this.filters.emit(this.pagination)
  }
}
