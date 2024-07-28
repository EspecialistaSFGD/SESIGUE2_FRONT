import { Component, OnInit, ViewContainerRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { Subject, debounceTime } from 'rxjs';
import { TraerPerfilesInterface } from '../../../libs/interfaces/configuracion/perfil.interface';
import { PerfilesService } from '../../../libs/services/configuraciones/perfiles.service';
import { PageHeaderComponent } from '../../../libs/shared/layout/page-header/page-header.component';
import { PerfilModel } from '../../../libs/models/auth/perfil.model';
import { PerfilComponent } from './perfil/perfil.component';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTableModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzSpaceModule,
    NzDropDownModule,
    NzDrawerModule,
    NzBadgeModule,
  ],
  templateUrl: './perfiles.component.html',
  styleUrl: './perfiles.component.less'
})
export class PerfilesComponent implements OnInit {
  searchForm!: UntypedFormGroup;
  title: string = 'Gestión de perfiles';
  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string = 'codigoPerfil';
  sortOrder: string = 'descend';
  isDrawervisible: boolean = false;

  nombrePerfilSeleccionado: string | null = '';

  private fb = inject(UntypedFormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  public perfilesService = inject(PerfilesService);
  public filterCounter = signal<number>(0);

  private updateParamsSubject = new Subject<void>();
  private updatingParams = false;
  private clearingFilters = false;
  private timeout: any;

  private modal = inject(NzModalService);

  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);

  constructor() {
    this.crearSearForm();

    this.activatedRoute.queryParams.subscribe((params) => {
      if (!this.updatingParams) {
        if (params['perfil']) {
          this.nombrePerfilSeleccionado = params['perfil'];
        }

        if (params['pageIndex']) {
          this.pageIndex = parseInt(params['pageIndex']);
        }

        if (params['pageSize']) {
          this.pageSize = parseInt(params['pageSize']);
        }

        if (params['sortField']) {
          this.sortField = params['sortField'];
        }

        if (params['sortOrder']) {
          this.sortOrder = params['sortOrder'];
        }

        this.filterCounter.set(
          (this.nombrePerfilSeleccionado ? 1 : 0)
        );
      }
    });

    this.updateParamsSubject.pipe(debounceTime(300)).subscribe(() => {
      this.updateQueryParams();
    });
  }

  ngOnInit(): void {
    this.searchForm.patchValue({
      nombrePerfil: this.nombrePerfilSeleccionado,
    });
  }


  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  traerPerfiles({
    codigoPerfil = 0,
    entidadId = 0,
    nombrePerfilSeleccionado = this.nombrePerfilSeleccionado,
    pageIndex = this.pageIndex,
    pageSize = this.pageSize,
    sortField = this.sortField,
    sortOrder = this.sortOrder
  }: TraerPerfilesInterface): void {
    this.perfilesService.listarPerfiles(
      entidadId,
      nombrePerfilSeleccionado,
      pageIndex,
      pageSize,
      sortField,
      sortOrder
    );
  }

  onAddEdit(value: PerfilModel | null): void {
    const title = value ? 'Editar perfil' : 'Crear perfil';
    const labelOk = value ? 'Actualizar' : 'Crear';

    this.perfilesService.seleccionarPerfilById(value?.codigoPerfil);

    const modal = this.modal.create<PerfilComponent>({
      nzTitle: title,
      nzContent: PerfilComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzMaskClosable: false,
      nzClosable: false,
      nzKeyboard: false,
      nzFooter: [
        {
          label: 'Cancelar',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: labelOk,
          type: 'primary',
          onClick: (componentInstance) => {
            return this.perfilesService.agregarPerfil(componentInstance!.perfilForm.value).then(() => {
              this.modal.closeAll();
            });
          },
          loading: this.perfilesService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.perfilForm.valid,
        },
      ]
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.perfilForm.reset();
    });
  }

  onDelete(value: PerfilModel): void {
    if (value == null) return;
    this.confirmModal = this.modal.confirm({
      nzTitle: '¿Está seguro de eliminar este perfil?',
      nzContent: 'Esta acción no se puede deshacer.',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.perfilesService.eliminarPerfil(value.codigoPerfil!)
      },
      nzCancelText: 'Cancelar',
    });
  }

  updateQueryParams(): void {
    this.updatingParams = true;

    const queryParams = {
      perfil: this.nombrePerfilSeleccionado,
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

  onClearFilters(): void {
    this.clearingFilters = true;

    this.searchForm.reset();

    this.nombrePerfilSeleccionado = '';
    this.pageIndex = 1;
    this.pageSize = 10;

    this.filterCounter.set(0);

    this.traerPerfiles({
      nombrePerfilSeleccionado: null,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    });

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        perfil: null,
        pageIndex: 1,
        pageSize: 10,
        sortField: null,
        sortOrder: 'descend',
      },
      queryParamsHandling: 'merge',
    }).finally(() => {
      this.clearingFilters = false;
    });
  }

  onOpenDrawer(): void {
    this.isDrawervisible = true;
  }

  onCloseDrawer(): void {
    this.isDrawervisible = false;
  }

  onNombrePerfilChange(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        $this.executeCuiListing(event.target.value);
      }
    }, 500);
  }

  private executeCuiListing(value: string) {
    this.nombrePerfilSeleccionado = value;
    this.traerPerfiles({ nombrePerfilSeleccionado: value });
    this.updateParamsSubject.next();
  }

  crearSearForm(): void {
    this.searchForm = this.fb.group({
      nombrePerfil: [null],
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

      this.traerPerfiles({
        pageIndex,
        pageSize,
        sortField: this.sortField,
        sortOrder: this.sortOrder
      });

      // Emitir cambios de parámetros
      this.updateParamsSubject.next();
    }
  }
}
