import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AsistenciaTecnicaResponse, AsistenciasTecnicasClasificacion, AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos } from '@interfaces/asistencia-tecnica.interface';
import { ItemEnum } from '@interfaces/helpers.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { AsistenciasTecnicasService } from '@services/asistencias-tecnicas.service';
import { UbigeosService } from '@services/ubigeos.service';
import { PageHeaderComponent } from '@shared/layout/page-header/page-header.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormularioAsistenciaTecnicaComponent } from './formulario-asistencia-tecnica/formulario-asistencia-tecnica.component';
import { UbigeoDepartmentResponse } from '@interfaces/ubigeo.interface';

@Component({
  selector: 'app-asistencia-tecnica',
  standalone: true,
  templateUrl: './asistencias-tecnicas.component.html',
  styles: ``,
  imports: [
    CommonModule,
    PageHeaderComponent,
    NzTableModule,
    NzSpaceModule,
    NzButtonModule,
    NzIconModule,
    FormularioAsistenciaTecnicaComponent
  ]
})
export class AsistenciasTecnicasComponent {
  title: string = `Lista de Asistencias Técnicas`;
  public asistenciasTecnicas = signal<AsistenciaTecnicaResponse[]>([])
  public departamentos = signal<UbigeoDepartmentResponse[]>([])
  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaAtencion',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }
  asistenciaId: number = 0
  showNzModal: boolean = false

  tipos: ItemEnum[] = Object.entries(AsistenciasTecnicasTipos).map(([value, text]) => ({ value, text }))
  modalidaades: ItemEnum[] = Object.entries(AsistenciasTecnicasModalidad).map(([value, text]) => ({ value, text }))
  clasificaciones: ItemEnum[] = Object.entries(AsistenciasTecnicasClasificacion).map(([value, text]) => ({ value, text }))

  private asistenciaTecnicaService = inject(AsistenciasTecnicasService)
  private ubigeoService = inject(UbigeosService)

  ngOnInit() {
    this.obtenerAsistenciasTecnicas()
    this.obtenerDepartamentos()
  }

  obtenerAsistenciasTecnicas() {
    this.asistenciaTecnicaService.getAllAsistenciasTecnicas(this.pagination)
      .subscribe(resp => {
        if (resp.success == true) {
          this.asistenciasTecnicas.set(resp.data)
          const { pageIndex, pageSize, total } = resp.info!
          this.pagination.currentPage = pageIndex
          this.pagination.pageSize = pageSize
          this.pagination.total = total
        } else {
          this.pagination.currentPage = 1
          this.pagination.pageSize = 10
          this.pagination.total = 0
        }
      })
  }

  obtenerDepartamentos() {
    this.ubigeoService.getDepartments()
      .subscribe(resp => {
        if (resp.success == true) {
          this.departamentos.set(resp.data)
        }
      })
  }

  getTextEnum(value: string, kind: string): string {
    let text = value
    if (kind == 'tipo') {
      text = this.tipos.find(item => item.value.toLowerCase() == value)!.text
    } else if (kind == 'modalidad') {
      text = this.modalidaades.find(item => item.value.toLowerCase() == value)!.text
    } else if (kind == 'clasificacion') {
      text = this.clasificaciones.find(item => item.value.toLowerCase() == value)!.text
    }
    return text
  }

  onQueryParamsChange(params: NzTableQueryParams): void {

  }

  goFormSaveAndEdit(asistenciaId: number) {
    this.showNzModal = true
    // console.log(asistenciaId);
    console.log('in main');
    console.log(this.showNzModal);
  }
}
