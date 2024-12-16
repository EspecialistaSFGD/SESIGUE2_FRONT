import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsistenciasTecnicasClasificacion, AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos, AsistenciaTecnicaResponse, ItemEnum, Pagination, UbigeoDepartmentResponse } from '@core/interfaces';
import { AsistenciasTecnicasService, UbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@shared/layout/page-header/page-header.component';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormularioAsistenciaTecnicaComponent } from './formulario-asistencia-tecnica/formulario-asistencia-tecnica.component';

@Component({
  selector: 'app-asistencia-tecnica',
  standalone: true,
  templateUrl: './asistencias-tecnicas.component.html',
  styles: ``,
  imports: [
    CommonModule,
    PageHeaderComponent,
    NgZorroModule,
    FormularioAsistenciaTecnicaComponent
  ]
})
export class AsistenciasTecnicasComponent {
  title: string = `Lista de Atenciones`;
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

  paramsExist: boolean = false
  asistenciaTecnica!: AsistenciaTecnicaResponse
  create: boolean = true
  showNzModal: boolean = false

  confirmModal?: NzModalRef;
  tipos: ItemEnum[] = Object.entries(AsistenciasTecnicasTipos).map(([value, text]) => ({ value: value.toLowerCase(), text }))
  modalidaades: ItemEnum[] = Object.entries(AsistenciasTecnicasModalidad).map(([value, text]) => ({ value: value.toLowerCase(), text }))
  clasificaciones: ItemEnum[] = Object.entries(AsistenciasTecnicasClasificacion).map(([value, text]) => ({ value: value.toLowerCase(), text }))

  private modal = inject(NzModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private asistenciaTecnicaService = inject(AsistenciasTecnicasService)
  private ubigeoService = inject(UbigeosService)


  constructor() {
    this.getParams()
  }

  ngOnInit() {
    this.obtenerAsistenciasTecnicas()
    this.obtenerDepartamentos()
  }

  getParams() {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.paramsExist = true
        const relations = [
          { param: 'entidad', field: 'entidadId' },
          { param: 'tipoEntidad', field: 'tipoEntidadId' },
          { param: 'espacio', field: 'espacioId' },
        ]

        let campo = params['campo'] ?? 'fechaAtencion'
        const finded = relations.find(item => item.param == campo)
        if (finded) {
          campo = finded.field
        }

        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'
        this.obtenerAsistenciasTecnicas()
      } else {
        this.pagination.columnSort = 'fechaAtencion'
      }

    });
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
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const qtySorts = params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)
    const ordenar = sorts?.value!.slice(0, -3)
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { pagina: params.pageIndex, cantidad: params.pageSize, campo: sorts?.key, ordenar }
      }
    );
  }

  updatedAsistencia(asistencia: AsistenciaTecnicaResponse) {
    this.asistenciaTecnica = asistencia
    this.create = false
    this.showNzModal = true
  }

  eliminarAsistencia(asistenciaId: string) {
    this.confirmModal = this.modal.confirm({
      nzTitle: '¿Está seguro de eliminar esta asistencia técnica?',
      nzContent: 'Esta acción no se puede deshacer.',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.asistenciaTecnicaService.deleteAsistenciaTecnica(asistenciaId)
          .subscribe(resp => {
            if (resp.success == true) {
              console.log('Se ha eliminado con exito');
              this.obtenerAsistenciasTecnicas()
            }
          })
      },
      nzCancelText: 'Cancelar',
    });
  }

  getAddFormAdded(success: boolean) {
    if (success) {
      this.obtenerAsistenciasTecnicas()
      this.showNzModal = true
    }
  }

  crearAsistenciaTecnica() {
    this.create = true
    const fechaAtencion = new Date();
    this.asistenciaTecnica = {
      tipo: '',
      modalidad: '',
      fechaAtencion,
      lugarId: '',
      nombreLugar: '',
      tipoEntidadId: '',
      nombreTipoEntidad: '',
      entidadId: '',
      ubigeoEntidad: '',
      nombreEntidad: '',
      autoridad: false,
      dniAutoridad: '',
      nombreAutoridad: '',
      cargoAutoridad: '',
      congresista: false,
      dniCongresista: '',
      nombreCongresista: '',
      clasificacion: '',
      espacioId: '',
      nombreEspacio: '',
      tema: '',
      comentarios: '',
      evidenciaReunion: '',
      evidenciaAsistencia: ''
    }
    this.showNzModal = true
  }
}
