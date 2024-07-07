import { Component, OnInit, inject, signal } from '@angular/core';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { AnchorModel } from '../../../libs/models/shared/anchor.model';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
// import { RequerimientoModel } from '../../../libs/models/requerimiento/requerimiento.model';
import { EstadoComponent } from '../../../shared/components/estado/estado.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { TiposService } from '../../../libs/services/shared/tipos.service';
import { SelectModel } from '../../../libs/models/shared/select.model';
import { RouterModule } from '@angular/router';
import { PageHeaderFullComponent } from '../../../shared/layout/page-header-full/page-header-full.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTableModule,
    PageHeaderFullComponent,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputModule,
    NzIconModule,
    EstadoComponent,
    NzButtonModule,
    NzSpaceModule,
    NzCardModule,
  ],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.less']
})
export class InicioComponent {
  // public requerimientosService = inject(RequerimientosService);
  // public tiposService = inject(TiposService);
  private fb = inject(UntypedFormBuilder);
  private modal = inject(NzModalService);

  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  title: string = 'Sistema de Seguimiento de Espacios de Articulación';

  links: AnchorModel[] = [
    {
      title: 'Ver manuales',
      href: '#',
    }
  ];

  breadcrumbs: AnchorModel[] = [];

  buttons: AnchorModel[] = [
    {
      title: 'Nuevo requerimiento',
      type: 'primary',
      href: 'requerimiento',
      icon: 'plus'
    }
  ];

  timeout: any = null;


  constructor() {
    this.crearSearForm();
  }

  // traerRequerimientos(): void {
  //   this.requerimientosService.listarRequerimientos(
  //     this.requerimientosService.idTipo(),
  //     this.requerimientosService.idEstado(),
  //     //this.requerimientosService.fecBusqueda(),
  //     this.requerimientosService.nomRegistro(),
  //     this.requerimientosService.pageIndex(),
  //     this.requerimientosService.pageSize(),
  //     this.requerimientosService.sortField(),
  //     this.requerimientosService.sortOrder()
  //   );
  // }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  // onDelete(data: RequerimientoModel): void {
  //   this.modal.confirm({
  //     nzTitle: `¿Desea eliminar el registro ${data.nomRequerimiento!}?`,
  //     nzContent: 'Esta acción no podrá deshacerse',
  //     nzOkText: 'Si',
  //     nzOkDanger: true,
  //     nzOnOk: () => {

  //     },
  //     nzCancelText: 'No',
  //   });
  // }

  // onTipoAdquisicionChange(event: SelectModel): void {
  //   if (event) {
  //     this.requerimientosService.listarRequerimientos(
  //       Number(event.value),
  //       this.requerimientosService.idEstado(),
  //       //this.requerimientosService.fecBusqueda(),
  //       this.requerimientosService.nomRegistro(),
  //       this.requerimientosService.pageIndex(),
  //       this.requerimientosService.pageSize(),
  //       this.requerimientosService.sortField(),
  //       this.requerimientosService.sortOrder()
  //     );
  //   } else {
  //     this.requerimientosService.listarRequerimientos(
  //       0,
  //       this.requerimientosService.idEstado(),
  //       //this.requerimientosService.fecBusqueda(),
  //       this.requerimientosService.nomRegistro(),
  //       this.requerimientosService.pageIndex(),
  //       this.requerimientosService.pageSize(),
  //       this.requerimientosService.sortField(),
  //       this.requerimientosService.sortOrder()
  //     );
  //   }
  // }

  // onEstadoChange(event: SelectModel): void {
  //   if (event) {
  //     this.requerimientosService
  //       .listarRequerimientos(
  //         this.requerimientosService.idTipo(),
  //         Number(event.value),
  //         //this.requerimientosService.fecBusqueda(),
  //         this.requerimientosService.nomRegistro(),
  //         this.requerimientosService.pageIndex(),
  //         this.requerimientosService.pageSize(),
  //         this.requerimientosService.sortField(),
  //         this.requerimientosService.sortOrder(),
  //       );
  //   } else {
  //     this.requerimientosService.listarRequerimientos(
  //       this.requerimientosService.idTipo(),
  //       0,
  //       //this.requerimientosService.fecBusqueda(),
  //       this.requerimientosService.nomRegistro(),
  //       this.requerimientosService.pageIndex(),
  //       this.requerimientosService.pageSize(),
  //       this.requerimientosService.sortField(),
  //       this.requerimientosService.sortOrder()
  //     );
  //   }
  // }

  // onFecBusquedaChange(event: Date[]): void {
  //   this.requerimientosService.listarRequerimientos(
  //     this.requerimientosService.idTipo(),
  //     this.requerimientosService.idEstado(),
  //     event,
  //     this.requerimientosService.nomRegistro(),
  //     this.requerimientosService.pageIndex(),
  //     this.requerimientosService.pageSize(),
  //     this.requerimientosService.sortField(),
  //     this.requerimientosService.sortOrder()
  //   );
  // }

  // onKeySearch(event: any) {
  //   clearTimeout(this.timeout);
  //   var $this = this;
  //   this.timeout = setTimeout(function () {
  //     if (event.keyCode != 13) {
  //       $this.executeListing(event.target.value);
  //     }
  //   }, 500);
  // }

  // private executeListing(value: string) {
  //   this.requerimientosService.listarRequerimientos(
  //     this.requerimientosService.idTipo(),
  //     this.requerimientosService.idEstado(),
  //     //this.requerimientosService.fecBusqueda(),
  //     value,
  //     this.requerimientosService.pageIndex(),
  //     this.requerimientosService.pageSize(),
  //     this.requerimientosService.sortField(),
  //     this.requerimientosService.sortOrder()
  //   );
  // }

  // onClearSearch(): void {
  //   this.searchForm.get('termino')?.setValue('');

  //   this.requerimientosService.listarRequerimientos(
  //     this.requerimientosService.idTipo(),
  //     this.requerimientosService.idEstado(),
  //     //null,
  //     '',
  //     this.requerimientosService.pageIndex(),
  //     this.requerimientosService.pageSize(),
  //     this.requerimientosService.sortField(),
  //     this.requerimientosService.sortOrder()
  //   );
  // }

  // onQueryParamsChange(params: NzTableQueryParams): void {
  //   const { pageSize, pageIndex, sort, filter } = params;
  //   const currentSort = sort.find(item => item.value !== null);
  //   const sortField = (currentSort && currentSort.key) || null;
  //   const sortOrder = (currentSort && currentSort.value) || null;

  //   this.requerimientosService.listarRequerimientos(
  //     this.requerimientosService.idTipo(),
  //     this.requerimientosService.idEstado(),
  //     //this.requerimientosService.fecBusqueda(),
  //     this.requerimientosService.nomRegistro(),
  //     pageIndex,
  //     pageSize,
  //     sortField,
  //     sortOrder
  //   );
  // }

  crearSearForm(): void {
    this.searchForm = this.fb.group({
      tipoAdquisicion: [0],
      estado: [0],
      fecBusqueda: [null],
      termino: [null],
    });
  }
}
