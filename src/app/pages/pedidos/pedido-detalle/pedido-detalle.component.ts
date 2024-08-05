import { Component, inject, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { AcuerdosService } from '../../../libs/services/pedidos/acuerdos.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PermisoModel } from '../../../libs/models/auth/permiso.model';
import { CommonModule } from '@angular/common';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { PageHeaderComponent } from '../../../libs/shared/layout/page-header/page-header.component';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { PedidosService } from '../../../libs/services/pedidos/pedidos.service';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { debounceTime } from 'rxjs';
import { TraerAcuerdosPorPedidoInterface } from '../../../libs/interfaces/pedido/pedido.interface';
import { AcuerdoPedidoModel } from '../../../libs/models/pedido';
import { AcuerdoComponent } from '../../acuerdos/acuerdo/acuerdo.component';
import { AcuerdoType } from '../../../libs/shared/types/acuerdo.type';
import { AccionType } from '../../../libs/shared/types/accion.type';
import { AddEditAcuerdoModel } from '../../../libs/models/shared/add-edit-acuerdo.model';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    NzDescriptionsModule,
    NzTableModule,
    NzButtonModule,
    NzSpaceModule,
    NzToolTipModule,
    NzDropDownModule,
    NzIconModule,
    NzRadioModule,
    NzModalModule,
    NzBadgeModule,
    NzTagModule,
  ],
  templateUrl: './pedido-detalle.component.html',
  styles: ``
})
export class PedidoDetalleComponent {
  private updateParamsSubject: Subject<void> = new Subject<void>();
  private updatingParams: boolean = false;

  public acuerdosService = inject(AcuerdosService);
  public pedidosService = inject(PedidosService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private modal = inject(NzModalService);

  id: string | null = null;
  acuerdoId: number | null = null;
  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);
  permiso: PermisoModel | null | undefined = null;
  storedPermiso = localStorage.getItem('permisos');
  fechaDateFormat = 'dd/MM/yyyy';

  pageIndex: number = 1;
  pageSize: number = 20;
  sortField: string = 'prioridadID';
  sortOrder: string = 'descend';

  constructor() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!this.id) {
      this.router.navigate(['/pedidos']); // Redirige a una página de error
    } else {
      this.pedidosService.recuperarPedido(Number(this.id));
      this.pedidosService.seleccionarPedidoById(Number(this.id));
      try {
        this.permiso = this.storedPermiso ? JSON.parse(this.storedPermiso) : {};
      } catch (e) {
        console.error('Error parsing JSON from localStorage', e);
        this.permiso = null;
      }

      this.activatedRoute.queryParams.subscribe((params) => {
        if (!this.updatingParams) {

          if (params['pageIndex'] != null) {
            this.pageIndex = Number(params['pageIndex']);
          }

          if (params['pageSize'] != null) {
            this.pageSize = Number(params['pageSize']);
          }

          if (params['sortField'] != null) {
            this.sortField = params['sortField'];
          }

          if (params['sortOrder'] != null) {
            this.sortOrder = params['sortOrder'];
          }
        }
      });

      this.updateParamsSubject.pipe(debounceTime(300)).subscribe(() => {
        this.updateQueryParams();
      });
    }
  }

  traerAcuerdos({
    prioridadID = Number(this.id) || null,
    pageIndex = this.pageIndex,
    pageSize = this.pageSize,
    sortField = this.sortField,
    sortOrder = this.sortOrder
  }: TraerAcuerdosPorPedidoInterface): void {
    this.acuerdosService.listarAcuerdosPorPedido(prioridadID, pageIndex, pageSize, sortField, sortOrder);
  }

  // onAddEdits(value: AcuerdoPedidoModel | null, isCreatigPreAcuerdo: boolean | null = null, isConverting: boolean | null = null): void {
  //   let title: string;
  //   let labelOk: string;

  //   if (value) {
  //     if (isConverting) {
  //       title = 'Convertir Pre acuerdo a Acuerdo';
  //       labelOk = 'Convertir';
  //     } else {
  //       title = 'Editar Acuerdo';
  //       labelOk = 'Actualizar';
  //     }
  //   } else {
  //     if (isCreatigPreAcuerdo) {
  //       title = 'Agregar Pre acuerdo';
  //       labelOk = 'Agregar';
  //     } else {
  //       title = 'Agregar Acuerdo';
  //       labelOk = 'Agregar';
  //     }
  //   }

  //   this.acuerdosService.seleccionarAcuerdoById(value?.acuerdoId, isCreatigPreAcuerdo, isConverting);

  //   const modal = this.modal.create<AcuerdoComponent>({
  //     nzTitle: title,
  //     nzContent: AcuerdoComponent,
  //     nzViewContainerRef: this.viewContainerRef,
  //     nzMaskClosable: false,
  //     nzClosable: false,
  //     nzKeyboard: false,
  //     nzFooter: [
  //       {
  //         label: 'Cancelar',
  //         type: 'default',
  //         onClick: () => this.modal.closeAll(),
  //       },
  //       {
  //         label: labelOk,
  //         type: 'primary',
  //         onClick: (componentInstance) => {
  //           if (isConverting) {
  //             return this.acuerdosService.convertirAcuerdo(componentInstance!.acuerdoForm.value).then(() => {
  //               this.modal.closeAll();
  //             });
  //           } else {
  //             return this.acuerdosService.agregarAcuerdo(componentInstance!.acuerdoForm.value).then(() => {
  //               this.modal.closeAll();
  //             });
  //           }
  //         },
  //         loading: this.acuerdosService.isEditing(),
  //         disabled: (componentInstance) => !componentInstance?.acuerdoForm.valid,
  //       },
  //     ],
  //   });

  //   const instance = modal.getContentComponent();
  //   modal.afterClose.subscribe(result => {
  //     instance.acuerdoForm.reset();
  //   });
  // }

  onAddEdit(value: AcuerdoPedidoModel | null, tipo: AcuerdoType, accion: AccionType): void {
    let title: string = '';
    let labelOk: string = '';

    switch (accion) {
      case 'CREATE':
        title = `Agregar ${tipo}`;
        labelOk = 'Agregar';
        break;
      case 'EDIT':
        title = `Editar  ${tipo}`;
        labelOk = 'Actualizar';
        break;
      case 'CONVERT':
        title = 'Convertir Pre acuerdo a Acuerdo';
        labelOk = 'Convertir';
        break;
    }

    this.acuerdosService.seleccionarAcuerdoById(value?.acuerdoId);

    const modal = this.modal.create<AcuerdoComponent, AddEditAcuerdoModel>({
      nzTitle: title,
      nzContent: AcuerdoComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzMaskClosable: false,
      nzClosable: false,
      nzKeyboard: false,
      nzData: { tipo, accion },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: labelOk,
          type: 'primary',
          onClick: (componentInstance) => {
            if (accion === 'CONVERT') {
              return this.acuerdosService.convertirAcuerdo(componentInstance!.acuerdoForm.value).then(() => {
                this.modal.closeAll();
              });
            } else {
              return this.acuerdosService.agregarAcuerdo(componentInstance!.acuerdoForm.value).then(() => {
                this.modal.closeAll();
              });
            }
          },
          loading: this.acuerdosService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.acuerdoForm.valid,
        },
      ],
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.acuerdoForm.reset();
    });
  }

  onDelete(acuerdo: AcuerdoPedidoModel): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: '¿Estás seguro de eliminar este Pre Acuerdo?',
      nzContent: 'Esta acción no se puede deshacer',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.acuerdosService.eliminarAcuerdo(acuerdo);
      },
    });
  }

  updateQueryParams() {
    this.updatingParams = true;

    const queryParams = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    };

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge'
    }).finally(() => {
      this.updatingParams = false;
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    if (!this.updatingParams) {
      const { pageSize, pageIndex, sort } = params;
      const currentSort = sort.find(item => item.value !== null);
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;
      this.sortField = (currentSort && currentSort.key) || this.sortField;
      this.sortOrder = (currentSort && currentSort.value) || this.sortOrder;

      this.traerAcuerdos({
        prioridadID: Number(this.id),
        pageIndex,
        pageSize,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
      });

      this.updateQueryParams();
    }
  }
}
