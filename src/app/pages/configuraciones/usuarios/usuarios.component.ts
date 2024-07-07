import { Component, OnInit, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/layout/page-header/page-header.component';
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
import { SelectModel } from '../../../libs/models/shared/select.model';
import { Subject, debounceTime } from 'rxjs';
import { TraerUsuariosInterface } from '../../../libs/interfaces/configuracion/usuario.interface';
import { UsuariosService } from '../../../libs/services/configuraciones/usuarios.service';
import { PerfilesService } from '../../../libs/services/configuraciones/perfiles.service';
import { PerfilesStore } from '../../../libs/stores/shared/perfiles.store';

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
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.less'
})
export class UsuariosComponent implements OnInit {
  searchForm!: UntypedFormGroup;
  title: string = 'Gestión de usuarios';
  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string | null = 'codigoUsuario';
  sortOrder: string = 'descend';
  isDrawervisible: boolean = false;

  nombreUsuarioSeleccionado: string | null = '';
  nombreTrabajadorSeleccionado: string | null = '';
  perfilSeleccionado: SelectModel | null = null;

  private fb = inject(UntypedFormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  public usuariosService = inject(UsuariosService);
  public perfilesStore = inject(PerfilesStore);
  public filterCounter = signal<number>(0);

  private updateParamsSubject = new Subject<void>();
  private updatingParams = false;
  private clearingFilters = false;
  private timeout: any;

  constructor() {
    this.crearSearForm();

    this.activatedRoute.queryParams.subscribe((params) => {
      if (!this.updatingParams) {
        if (params['usuario']) {
          this.nombreUsuarioSeleccionado = params['usuario'];
        }

        if (params['trabajador']) {
          this.nombreTrabajadorSeleccionado = params['trabajador'];
        }

        if (params['perfil']) {
          this.perfilSeleccionado = { value: params['perfil'] };
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
          (this.nombreUsuarioSeleccionado ? 1 : 0) +
          (this.nombreTrabajadorSeleccionado ? 1 : 0) +
          (this.perfilSeleccionado ? 1 : 0)
        );
      }
    });

    this.updateParamsSubject.pipe(debounceTime(300)).subscribe(() => {
      this.updateQueryParams();
    });
  }

  ngOnInit(): void {
    this.searchForm.patchValue({
      nombreUsuario: this.nombreUsuarioSeleccionado,
      nombreTrabajador: this.nombreTrabajadorSeleccionado,
      perfil: this.perfilSeleccionado,
    });
  }


  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  traerUsuarios({
    nombreUsuarioSeleccionado = this.nombreUsuarioSeleccionado,
    nombreTrabajadorSeleccionado = this.nombreTrabajadorSeleccionado,
    perfilSeleccionado = this.perfilSeleccionado,
    pageIndex = this.pageIndex,
    pageSize = this.pageSize,
    sortField = this.sortField,
    sortOrder = this.sortOrder
  }: TraerUsuariosInterface): void {
    this.usuariosService.listarUsuarios(
      nombreUsuarioSeleccionado,
      nombreTrabajadorSeleccionado,
      perfilSeleccionado,
      pageIndex,
      pageSize,
      sortField,
      sortOrder
    );
  }

  updateQueryParams(): void {
    this.updatingParams = true;

    const queryParams = {
      usuario: this.nombreUsuarioSeleccionado,
      trabajador: this.nombreTrabajadorSeleccionado,
      perfil: this.perfilSeleccionado?.value,
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

    this.nombreUsuarioSeleccionado = '';
    this.nombreTrabajadorSeleccionado = '';
    this.perfilSeleccionado = null;
    this.pageIndex = 1;
    this.pageSize = 10;

    this.filterCounter.set(0);

    this.traerUsuarios({
      nombreUsuarioSeleccionado: null,
      nombreTrabajadorSeleccionado: null,
      perfilSeleccionado: null,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    });

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        usuario: null,
        trabajador: null,
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

  onNombreUsuarioChange(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        $this.executeCuiListing(event.target.value);
      }
    }, 500);
  }

  private executeCuiListing(value: string) {
    this.nombreUsuarioSeleccionado = value;
    this.traerUsuarios({ nombreUsuarioSeleccionado: value });
    this.updateParamsSubject.next();
  }

  onNombreTrabajadorChange(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        $this.executeCuiListingTrabajador(event.target.value);
      }
    }, 500);
  }

  private executeCuiListingTrabajador(value: string) {
    this.nombreTrabajadorSeleccionado = value;
    this.traerUsuarios({ nombreTrabajadorSeleccionado: value });
    this.updateParamsSubject.next();
  }

  onPerfilChange(value: SelectModel): void {
    if (this.clearingFilters) {
      return;
    }

    const wasPreviouslySelected = this.perfilSeleccionado != null;

    this.perfilSeleccionado = value;
    this.traerUsuarios({ perfilSeleccionado: value });

    if (value == null && wasPreviouslySelected) {
      this.filterCounter.update(x => x - 1);
    } else if (value != null && !wasPreviouslySelected) {
      this.filterCounter.update(x => x + 1);
    }

    this.updateParamsSubject.next();
  }

  crearSearForm(): void {
    this.searchForm = this.fb.group({
      nombreUsuario: [null],
      nombreTrabajador: [null],
      perfil: [null],
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

      this.traerUsuarios({
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
