import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { getDateFormat } from '@core/helpers';
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

  copyPagination: Pagination = {}
  sectorAuth: number = 0
  permisosPcm: boolean = false
  defaultDate: Date = new Date()

  private timeout: any;
  
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private authStore = inject(AuthService)
  private fb = inject(FormBuilder)
  private ubigeoService = inject(UbigeosService)

  formFilterPanelEntidades:FormGroup = this.fb.group({
    fecha: [[]],
    departamento: [null],
    provincia: [null],
    distrito: [null]
  })

  ngOnInit(): void {
    this.getPermisosPCM()
    this.obtenerServicioDepartamentos()
  }

  getPermisosPCM(){
    this.sectorAuth = Number(this.authStore.usuarioAuth().sector!.value) ?? 0
    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    this.permisosPcm = JSON.parse(permisosStorage) ?? false
  }

  obtenerServicioDepartamentos() {
    this.ubigeoService.getDepartments().subscribe(resp => this.departamentos.set(resp.data))
  }

  abrirFechas() {
    const selectedDates: Date[] = this.formFilterPanelEntidades.get('fecha')?.value || [];
    if (selectedDates.length > 0) {
      this.defaultDate = new Date(selectedDates[0]);
    }
  }

  obtenerfecha(){
    const selectedDates: Date[] = this.formFilterPanelEntidades.get('fecha')?.value || [];
    const [fechaInicio, fechaFin] = selectedDates;
    // fechaInicio ? this.copyPagination.fechaInicio = getDateFormat(fechaInicio, 'month') : delete this.copyPagination.fechaInicio
    // fechaFin ? this.copyPagination.fechaFin = getDateFormat(fechaFin, 'month') : delete this.copyPagination.fechaFin
    if(fechaInicio && fechaFin){
      this.setPagination()
    }
  }

  obtenerDepartamento(){
    const departamento = this.formFilterPanelEntidades.get('departamento')?.value
    const provinciaControl = this.formFilterPanelEntidades.get('provincia')
    const distritoControl = this.formFilterPanelEntidades.get('distrito')
    
    if(departamento){
      const ubigeo = `${departamento}0000`
      provinciaControl?.enable()
      this.obtenerProvinciasService(departamento)
       this.copyPagination.ubigeo = ubigeo
    } else {
      delete this.copyPagination.ubigeo
      provinciaControl?.disable()
      provinciaControl?.reset()
    }
    distritoControl?.disable()
    distritoControl?.reset()
    this.setPagination()    
  }

  obtenerProvinciasService(departamento: string) {
    this.ubigeoService.getProvinces(departamento).subscribe(resp => this.provincias.set(resp.data))
  }

  obtenerProvincia(){
    const departamento = this.formFilterPanelEntidades.get('departamento')?.value
    let ubigeo = `${departamento}0000`
    const provincia = this.formFilterPanelEntidades.get('provincia')?.value
    const distritoControl = this.formFilterPanelEntidades.get('distrito')  
    if(provincia){
      ubigeo = provincia
      distritoControl?.enable()
      this.obtenerDistritosService(ubigeo)
    } else {
      distritoControl?.disable()
    }
    this.copyPagination.ubigeo = ubigeo
    this.setPagination()
  }

  obtenerDistritosService(provincia: string) {
    this.ubigeoService.getDistricts(provincia).subscribe(resp => this.distritos.set(resp.data))
  }

  obtenerDistrito(){
    const provinciaValue = this.formFilterPanelEntidades.get('provincia')?.value
    const distritoValue = this.formFilterPanelEntidades.get('distrito')?.value
    const ubigeo = distritoValue ? distritoValue : provinciaValue
    this.copyPagination.ubigeo = ubigeo
    this.setPagination()
  }

  setPagination(){
    const selectedDates: Date[] = this.formFilterPanelEntidades.get('fecha')?.value || [];
    const [fechaInicio, fechaFin] = selectedDates;

    fechaInicio ? this.copyPagination.fechaInicio = getDateFormat(fechaInicio, 'month') : delete this.copyPagination.fechaInicio
    fechaFin ? this.copyPagination.fechaFin = getDateFormat(fechaFin, 'month') : delete this.copyPagination.fechaFin

    this.filterPagination.emit(this.copyPagination)
  }
}
