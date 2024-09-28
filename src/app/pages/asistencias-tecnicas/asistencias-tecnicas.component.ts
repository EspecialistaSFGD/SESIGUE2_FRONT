import { Component, inject, signal } from '@angular/core';
import { AsistenciaTecnicaResponse } from '@interfaces/asistencia-tecnica.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { AsistenciasTecnicasService } from '@services/asistencias-tecnicas.service';
import { PageHeaderComponent } from '@shared/layout/page-header/page-header.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormularioAsistenciaTecnicaComponent } from './formulario-asistencia-tecnica/formulario-asistencia-tecnica.component';

@Component({
  selector: 'app-asistencia-tecnica',
  standalone: true,
  templateUrl: './asistencias-tecnicas.component.html',
  styles: ``,
  imports: [
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

  private asistenciaTecnicaService = inject(AsistenciasTecnicasService)

  ngOnInit() {
    this.obtenerAsistenciasTecnicas()
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

  onQueryParamsChange(params: NzTableQueryParams): void {

  }

  goFormSaveAndEdit(asistenciaId: number) {
    this.showNzModal = true
    // console.log(asistenciaId);
    console.log('in main');
    console.log(this.showNzModal);
  }
}
