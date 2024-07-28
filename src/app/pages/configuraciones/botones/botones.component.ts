import { CommonModule } from '@angular/common';
import { Component, inject, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../libs/shared/layout/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { EstadoComponent } from '../../../libs/shared/components/estado/estado.component';
import { Subject } from 'rxjs';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { TraerBotonesInterface } from '../../../libs/models/shared/menu.model';
import { debounceTime } from 'rxjs/operators';
import { BotonComponent } from './boton/boton.component';
import { BotonesService } from '../../../libs/services/configuraciones/botones.services';
import { PerfilBotonModel } from '../../../libs/models/auth/perfil.model';

@Component({
  selector: 'app-botones',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    NzFormModule,
    ReactiveFormsModule,
    NzTableModule,
    NzSelectModule,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzSpaceModule,
    NzDropDownModule,
    NzDrawerModule,
    NzBadgeModule,
    NzToolTipModule,
    EstadoComponent
  ],
  templateUrl: './botones.component.html',
  styles: ``
})
export class BotonesComponent {
  title: string = `Gestión de Botones`;
  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string = 'codigoBoton';
  sortOrder: string = 'descend';

  private updateParamsSubject: Subject<void> = new Subject<void>();
  private updatingParams: boolean = false;

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private modal = inject(NzModalService);
  confirmModal?: NzModalRef;
  private viewContainerRef = inject(ViewContainerRef);
  public botonesService = inject(BotonesService);
  codigoMenu: number = 0;

  constructor() {

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

    // Debounce los cambios de parámetros de la URL
    this.updateParamsSubject.pipe(debounceTime(300)).subscribe(() => {
      this.updateQueryParams();
    });
  }

  traerBotones({
    codigoBoton = null,
    pageIndex = this.pageIndex,
    pageSize = this.pageSize,
    sortField = this.sortField,
    sortOrder = this.sortOrder,
  }: TraerBotonesInterface): void {
    this.botonesService.listarBotones(codigoBoton, pageIndex, pageSize, sortField, sortOrder);
  }

  onAddEdit(value: PerfilBotonModel | null): void {
    const title = value ? 'Editar Botón' : 'Agregar Botón';
    const labelOk = value ? 'Actualizar' : 'Agregar';

    this.botonesService.seleccionarBotonById(value?.codigoBoton);

    const modal = this.modal.create<BotonComponent>({
      nzTitle: title,
      nzContent: BotonComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzMaskClosable: false,
      nzClosable: false,
      nzKeyboard: false,
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
            return this.botonesService.agregarBoton(componentInstance!.botonForm.value).then((res) => {
              this.modal.closeAll();
            });
          },
          loading: this.botonesService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.botonForm.valid,
        },
      ],
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.botonForm.reset();
    });
  }

  onDelete(id: number): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: '¿Está seguro de eliminar este menú?',
      nzContent: 'Esta acción no se puede deshacer.',
      nzOnOk: () => {
        this.botonesService.eliminarBoton(id);
      },
    });
  }

  updateQueryParams(): void {
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
      queryParamsHandling: 'merge',
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

      this.traerBotones({
        codigoBoton: null,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        sortField: this.sortField,
        sortOrder: this.sortOrder
      });

      this.updateQueryParams();
    }
  }
}
