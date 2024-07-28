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
import { MenuModel, TraerMenuesInterface } from '../../../libs/models/shared/menu.model';
import { MenuesService } from '../../../libs/services/configuraciones/menues.service';
import { debounceTime } from 'rxjs/operators';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-menues',
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
  templateUrl: './menues.component.html',
  styles: ``
})
export class MenuesComponent {
  title: string = `Gestión de Menúes`;
  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string = 'codigoMenu';
  sortOrder: string = 'descend';

  private updateParamsSubject: Subject<void> = new Subject<void>();
  private updatingParams: boolean = false;

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private modal = inject(NzModalService);
  confirmModal?: NzModalRef;
  private viewContainerRef = inject(ViewContainerRef);
  public menuesService = inject(MenuesService);
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
        // this.traerMenues({
        //   codigoMenu: 0,
        //   pageIndex: this.pageIndex,
        //   pageSize: this.pageSize,
        //   sortField: this.sortField,
        //   sortOrder: this.sortOrder
        // });
      }
    });

    // Debounce los cambios de parámetros de la URL
    this.updateParamsSubject.pipe(debounceTime(300)).subscribe(() => {
      this.updateQueryParams();
    });
  }

  traerMenues({
    codigoMenu = 0,
    pageIndex = this.pageIndex,
    pageSize = this.pageSize,
    sortField = this.sortField,
    sortOrder = this.sortOrder,
  }: TraerMenuesInterface): void {
    this.menuesService.listarMenues(codigoMenu, pageIndex, pageSize, sortField, sortOrder);
  }

  onAddEdit(value: MenuModel | null): void {
    const title = value ? 'Editar Menú' : 'Agregar Menú';
    const labelOk = value ? 'Actualizar' : 'Agregar';

    this.menuesService.seleccionarMenuById(value?.codigoMenu);

    const modal = this.modal.create<MenuComponent>({
      nzTitle: title,
      nzContent: MenuComponent,
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
            return this.menuesService.agregarMenu(componentInstance!.menuForm.value).then((res) => {
              this.modal.closeAll();
            });
          },
          loading: this.menuesService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.menuForm.valid,
        },
      ],
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.menuForm.reset();
    });
  }

  onDelete(id: number): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: '¿Está seguro de eliminar este menú?',
      nzContent: 'Esta acción no se puede deshacer.',
      nzOnOk: () => {
        this.menuesService.eliminarMenu(id);
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

      this.traerMenues({
        codigoMenu: 0,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        sortField: this.sortField,
        sortOrder: this.sortOrder
      });

      this.updateQueryParams();
    }
  }
}
