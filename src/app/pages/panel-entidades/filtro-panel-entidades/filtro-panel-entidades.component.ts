import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Pagination, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { UbigeosService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { AuthService } from '@libs/services/auth/auth.service';

@Component({
  selector: 'app-filtro-panel-entidades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './filtro-panel-entidades.component.html',
  styles: ``
})
export class FiltroPanelEntidadesComponent {
  @Input() pagination!: Pagination

  @Output() filterPagination = new EventEmitter<Pagination>()

  sectorAuth: number = 0
  permisosPcm: boolean = false

  private timeout: any;
  
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private authStore = inject(AuthService)
  private fb = inject(FormBuilder)
  private ubigeoService = inject(UbigeosService)

  formFilterPanelEntidades:FormGroup = this.fb.group({
    fechaDesde: [null],
    fechaHasta: [null],
    ubigeo: [null],
    departamento: [null],
    provincia: [null],
    distrito: [null]
  })

  getPermisosPCM(){
    this.sectorAuth = Number(this.authStore.usuarioAuth().sector!.value) ?? 0
    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    this.permisosPcm = JSON.parse(permisosStorage) ?? false
  }

  obtenerDepartamento(){
    const departamento = this.formFilterPanelEntidades.get('departamento')?.value
    const provinciaControl = this.formFilterPanelEntidades.get('provincia')
    const distritoControl = this.formFilterPanelEntidades.get('distrito')
    const ubigeoControl = this.formFilterPanelEntidades.get('ubigeo')
    if(departamento){
      const ubigeo = `${departamento}0000`
      provinciaControl?.enable()
      this.obtenerProvinciasService(departamento)
       ubigeoControl?.setValue(ubigeo)
    } else {
      delete this.pagination.ubigeo
      provinciaControl?.disable()
      provinciaControl?.reset()
      ubigeoControl?.setValue(null)
      this.setPagination()
    }
    
    distritoControl?.disable()
    distritoControl?.reset()
  }

  obtenerProvinciasService(departamento: string) {
    this.ubigeoService.getProvinces(departamento).subscribe(resp => this.provincias.set(resp.data))
  }

  obtenerProvincia(){
    const departamento = this.formFilterPanelEntidades.get('departamento')?.value
    let ubigeo = `${departamento.departamentoId}0000`
    const provincia = this.formFilterPanelEntidades.get('provincia')?.value
    const distritoControl = this.formFilterPanelEntidades.get('distrito')  
    if(provincia){
      ubigeo = provincia
      distritoControl?.enable()
      this.obtenerDistritosService(ubigeo)
    } else {
      distritoControl?.disable()
    }
    this.formFilterPanelEntidades.get('ubigeo')?.setValue(ubigeo)
  }

  obtenerDistritosService(provincia: string) {
    this.ubigeoService.getDistricts(provincia).subscribe(resp => this.distritos.set(resp.data))
  }

  obtenerDistrito(){
    const provinciaValue = this.formFilterPanelEntidades.get('provincia')?.value
    const distritoValue = this.formFilterPanelEntidades.get('distrito')?.value
    const ubigeo = distritoValue ? distritoValue : provinciaValue
    this.formFilterPanelEntidades.get('ubigeo')?.setValue(ubigeo)
  }

  setPagination(){
    this.filterPagination.emit(this.pagination)
  }
}
