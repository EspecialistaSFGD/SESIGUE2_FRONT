import { AfterViewInit, Component, OnInit, Signal, ViewContainerRef, inject, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { PedidosService } from '../../libs/services/pedidos/pedidos.service';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { SelectModel } from '../../libs/models/shared/select.model';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { EspaciosStore } from '../../libs/shared/stores/espacios.store';
import { SectoresStore } from '../../libs/shared/stores/sectores.store';
import { UbigeosStore } from '../../libs/shared/stores/ubigeos.store';
import { TraerPedidosInterface } from '../../libs/interfaces/pedido/pedido.interface';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PageHeaderComponent } from '../../libs/shared/layout/page-header/page-header.component';
import { PedidoModel } from '../../libs/models/pedido';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PedidoComponent } from './pedido/pedido.component';
import { PermisoModel } from '../../libs/models/auth/permiso.model';
import { UtilesService } from '../../libs/shared/services/utiles.service';
import { ComentarioComponent } from '../../libs/shared/components/comentario/comentario.component';
import { ComentarioModel } from '../../libs/models/pedido/comentario.model';
import { AuthService } from '../../libs/services/auth/auth.service';
import { PedidoType } from '../../libs/shared/types/pedido.type';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@Component({
  selector: 'app-pedidos',
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
    NzToolTipModule,
    NzAvatarModule,
  ],
  templateUrl: './pedidos.component.html',
  styles: ``
})
export class PedidosComponent implements OnInit, AfterViewInit {
  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  // entidadSeleccionada: SelectModel = { value: 1, label: 'GOBIERNO REGIONAL DE LORETO' };
  title: string = `Lista de pedidos`;

  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string | null = 'prioridadID';
  sortOrder: string | null = 'descend';
  isDrawervisible: boolean = false;

  cui: string | null = null;
  espaciosSeleccionados: SelectModel[] | null = null;
  sectoresSeleccionados: SelectModel[] | null = null;
  depSeleccionado: SelectModel | null = null;
  provSeleccionada: SelectModel | null = null;
  filterCounter = signal<number>(0);

  // permiso: PermisoModel | null | undefined = null;
  // storedPermiso = localStorage.getItem('permisos');

  // departamento: SelectModel = {} as SelectModel;
  // sector: SelectModel = {} as SelectModel;
  // subTipo: PedidoType = null;

  private updateParamsSubject = new Subject<void>();
  private updatingParams = false;
  private clearingFilters = false;
  private timeout: any;

  public pedidosService = inject(PedidosService);
  private fb = inject(UntypedFormBuilder);
  public espaciosStore = inject(EspaciosStore);
  public sectoresStore = inject(SectoresStore);
  public ubigeosStore = inject(UbigeosStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  authService = inject(AuthService);
  private modal = inject(NzModalService);
  public utilesService = inject(UtilesService);
  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);

  constructor() {
    this.crearSearForm();
    // this.subTipo = this.authService.getSubTipo();

    try {
      // this.permiso = this.storedPermiso ? JSON.parse(this.storedPermiso) : {};
      // this.departamento = this.authService.getDepartamentoSelect() || {};
      // this.sector = this.authService.getSectorSelect() || {};
    } catch (e) {
      console.error('Error parsing JSON from localStorage', e);
      // this.permiso = null;
      // this.departamento = {} as SelectModel;
    }

    // console.log('Permiso:', this.permiso);

    // Obtener los valores de los queryParams en la primera carga
    this.activatedRoute.queryParams.subscribe((params) => {
      if (!this.updatingParams) {
        if (params['cui'] != null) {
          this.cui = params['cui'];
        }

        if (params['espacio'] != null) {
          const selectedValues = Array.isArray(params['espacio']) ? params['espacio'] : [params['espacio']];
          this.espaciosSeleccionados = selectedValues.map(value => ({ value: Number(value) }));
        } else {
          this.espaciosSeleccionados = [];
        }

        if (params['sector'] != null) {
          const selectedValues = Array.isArray(params['sector']) ? params['sector'] : [params['sector']];
          this.sectoresSeleccionados = selectedValues.map(value => ({ value: Number(value) }));
        }

        if (params['dep'] != null) {
          this.depSeleccionado = { value: Number(params['dep']) };
          this.onDepChange(this.depSeleccionado, true); // true indica que no se debe volver a navegar
        }

        if (params['prov'] != null) {
          this.provSeleccionada = { value: params['prov'] };
        }

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

        // Inicializar el contador con la suma de las selecciones iniciales
        this.filterCounter.set(
          (this.cui ? 1 : 0) +
          (this.espaciosSeleccionados ? this.espaciosSeleccionados.length : 0) +
          (this.sectoresSeleccionados ? this.sectoresSeleccionados.length : 0) +
          (this.depSeleccionado ? 1 : 0) +
          (this.provSeleccionada ? 1 : 0)
        );
      }
    });

    // Debounce los cambios de parámetros de la URL
    this.updateParamsSubject.pipe(debounceTime(300)).subscribe(() => {
      this.updateQueryParams();
    });
  }

  ngOnInit(): void {
    this.searchForm.patchValue({
      cui: this.cui,
      espacio: this.espaciosSeleccionados,
      sector: this.sectoresSeleccionados,
      dep: this.depSeleccionado,
      prov: this.provSeleccionada,
    });
  }

  ngAfterViewInit(): void { }

  traerPedidos(
    {
      cui = this.cui,
      espaciosSeleccionados = this.espaciosSeleccionados,
      sectoresSeleccionados = (this.authService.sector() && this.authService.subTipo() != 'PCM') ? [this.authService.sector()!] : this.sectoresSeleccionados,
      depSeleccionado = (this.authService.departamento()) ? this.authService.departamento() : this.depSeleccionado,
      provSeleccionada = (this.authService.provincia()) ? this.authService.provincia() : this.provSeleccionada,
      pageIndex = this.pageIndex,
      pageSize = this.pageSize,
      sortField = this.sortField,
      sortOrder = this.sortOrder
    }: TraerPedidosInterface
  ): void {
    this.pedidosService.listarPedidos(cui, espaciosSeleccionados, sectoresSeleccionados, depSeleccionado, provSeleccionada, pageIndex, pageSize, sortField, sortOrder);
  }


  onAddEdit(pedido: PedidoModel | null): void {
    const title = pedido ? 'Editar Pedido' : 'Agregar Pedido';
    const labelOk = pedido ? 'Actualizar' : 'Agregar';

    this.pedidosService.seleccionarPedidoById(pedido?.prioridadID);
    this.espaciosStore.listarEventos();

    const modal = this.modal.create<PedidoComponent, PedidoType>({
      nzTitle: title,
      nzContent: PedidoComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.authService.subTipo(),
      nzClosable: false,
      nzMaskClosable: false,
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
            return this.pedidosService.agregarPedido(componentInstance!.pedidoForm.value).then((res) => {
              this.traerPedidos({});
              this.modal.closeAll();
            });
          },
          loading: this.pedidosService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.pedidoForm.valid,
        }
      ]

    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.pedidoForm.reset();
    });
  }

  onGestionarPedido(pedido: PedidoModel | null): void {
    if (pedido == null) {
      return;
    }

    //Navegar hacia la página de gestión de hitos en /acuerdos/acuerdo/:id
    this.router.navigate(['pedidos', 'pedido', pedido?.prioridadID]);
  }

  onValidate(pedido: PedidoModel): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: 'Validar Pedido',
      nzContent: '¿Está seguro de validar este pedido?',
      nzOnOk: () => {
        this.pedidosService.validarPedido(pedido);
      }
    });
  }


  onCommentPCM(pedido: PedidoModel): void {
    this.pedidosService.seleccionarPedidoById(pedido.prioridadID);

    const modal = this.modal.create<ComentarioComponent, ComentarioModel>({
      nzTitle: 'Comentario PCM',
      nzContent: ComentarioComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        id: pedido.prioridadID,
        tipo: 'PEDIDO',
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Guardar',
          type: 'primary',
          onClick: (componentInstance) => {
            return this.pedidosService.comentarPcmPedido(componentInstance!.comentarioForm.value).then(() => {
              this.modal.closeAll();
            });
          },
          loading: this.pedidosService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.comentarioForm.valid,
        }
      ]
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.comentarioForm.reset();
    });
  }

  onEspacioChange(value: SelectModel[] | null): void {
    if (this.clearingFilters) {
      return;
    }

    value = value || [];

    const prevSelectedCount = this.espaciosSeleccionados ? this.espaciosSeleccionados.length : 0;
    const newSelectedCount = value.length;

    this.espaciosSeleccionados = value;
    this.traerPedidos({ espaciosSeleccionados: value });

    this.filterCounter.update(x => x + (newSelectedCount - prevSelectedCount));

    this.updateParamsSubject.next();
  }

  onSectorChange(value: SelectModel[] | null): void {
    if (this.clearingFilters) {
      return;
    }

    value = value || [];

    const prevSelectedCount = this.sectoresSeleccionados ? this.sectoresSeleccionados.length : 0;
    const newSelectedCount = value.length;

    this.sectoresSeleccionados = value;
    this.traerPedidos({ sectoresSeleccionados: value });

    this.filterCounter.update(x => x + (newSelectedCount - prevSelectedCount));

    this.updateParamsSubject.next();
  }

  onDepChange(value: SelectModel, skipNavigation = false): void {

    if (this.clearingFilters) {
      return;
    }

    const wasPreviouslySelected = this.depSeleccionado != null;

    this.depSeleccionado = value;
    this.traerPedidos({ depSeleccionado: value });

    if (value && value.value) {
      this.ubigeosStore.listarProvincias(value.value?.toString());

      if (this.provSeleccionada != null) {
        this.provSeleccionada = null;
        this.searchForm.patchValue({ prov: null });
        this.filterCounter.update(x => x - 1);
      }
    }

    if (value == null && wasPreviouslySelected) {
      this.filterCounter.update(x => x - 1);
    } else if (value != null && !wasPreviouslySelected) {
      this.filterCounter.update(x => x + 1);
    }

    if (!skipNavigation) {
      this.updateParamsSubject.next();
    }
  }

  onProvChange(value: SelectModel): void {
    if (this.clearingFilters) {
      return;
    }

    const wasPreviouslySelected = this.provSeleccionada != null;

    this.provSeleccionada = value;
    this.traerPedidos({ provSeleccionada: value });

    if (value == null && wasPreviouslySelected) {
      this.filterCounter.update(x => x - 1);
    } else if (value != null && !wasPreviouslySelected) {
      this.filterCounter.update(x => x + 1);
    }

    this.updateParamsSubject.next();
  }

  onCuiChange(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        $this.executeCuiListing(event.target.value);
      }
    }, 500);
  }

  private executeCuiListing(value: string) {
    this.cui = value;
    this.traerPedidos({ cui: value });
    this.updateParamsSubject.next();
  }

  updateQueryParams() {
    this.updatingParams = true;

    const queryParams = {
      cui: this.cui,
      espacio: this.espaciosSeleccionados ? this.espaciosSeleccionados.map(x => x.value) : null,
      sector: this.sectoresSeleccionados ? this.sectoresSeleccionados.map(x => x.value) : null,
      dep: this.depSeleccionado ? this.depSeleccionado.value : null,
      prov: this.provSeleccionada ? this.provSeleccionada.value : null,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder
    };

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge'
    }).finally(() => {
      this.updatingParams = false;
    });
  }

  onClearFilters(): void {
    this.clearingFilters = true;

    // Guardar el valor actual de depSeleccionado si departamento tiene un valor
    const depSeleccionadoActual = this.authService.departamento() ? this.depSeleccionado : null;
    const sectorSeleccionadoActual = this.authService.sector() ? this.sectoresSeleccionados : null;

    // Resetear manualmente cada campo excepto el campo de departamento
    this.searchForm.patchValue({
      cui: null,
      // dep: (this.authService.getSubTipo() == 'PCM') ? null : this.departamento,
      espacio: null,
      // sector: (this.authService.getSubTipo() == 'PCM') ? null : this.sector,
      prov: null,
    });

    this.cui = null;
    this.espaciosSeleccionados = [];
    this.sectoresSeleccionados = [];
    this.provSeleccionada = null;
    this.pageIndex = 1;
    this.pageSize = 10;

    // Si existe un departamento, mantener el valor de depSeleccionado
    this.depSeleccionado = depSeleccionadoActual;
    this.sectoresSeleccionados = sectorSeleccionadoActual;

    // Actualizar el contador de filtros
    this.filterCounter.set(
      (this.cui ? 1 : 0) +
      (this.espaciosSeleccionados ? this.espaciosSeleccionados.length : 0) +
      (this.sectoresSeleccionados ? this.sectoresSeleccionados.length : 0) +
      (this.depSeleccionado ? 1 : 0) +
      (this.provSeleccionada ? 1 : 0)
    );

    // Hacer una sola llamada a traerPedidos con los parámetros vacíos
    this.traerPedidos({
      cui: null,
      espaciosSeleccionados: [],
      sectoresSeleccionados: this.sectoresSeleccionados,
      depSeleccionado: this.depSeleccionado,
      provSeleccionada: null,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder
    });

    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { cui: null, espacio: null, sector: this.sectoresSeleccionados ? this.sectoresSeleccionados[0].value : null, dep: this.depSeleccionado ? this.depSeleccionado.value : null, prov: null, pageIndex: this.pageIndex, pageSize: this.pageSize, sortField: this.sortField, sortOrder: this.sortOrder },
        queryParamsHandling: 'merge',
      }
    ).finally(() => {
      this.clearingFilters = false;
    });
  }

  onDelete(value: any): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: 'Eliminar Pedido',
      nzContent: '¿Está seguro de eliminar este pedido?',
      nzOkDanger: true,
      nzClosable: false,
      nzMaskClosable: false,
      nzOnOk: () => {
        this.pedidosService.eliminarPedido(value).then(() => {
          this.traerPedidos({});
        });
      },
    });
  }

  onOpenDrawer(): void {
    this.isDrawervisible = true;
    this.espaciosStore.listarEventos();
  }

  onCloseDrawer(): void {
    this.isDrawervisible = false;
  }

  crearSearForm(): void {
    this.searchForm = this.fb.group({
      cui: [null],
      espacio: [null],
      sector: [null],
      dep: [null],
      prov: [null],
    });
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onQueryParamsChange(params: NzTableQueryParams): void {
    if (!this.updatingParams) {

      const { pageSize, pageIndex, sort } = params;
      const currentSort = sort.find(item => item.value !== null);
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;
      this.sortField = (currentSort && currentSort.key) || this.sortField;
      this.sortOrder = (currentSort && currentSort.value) || this.sortOrder;

      // Verificar y establecer el valor predeterminado si espaciosSeleccionados está vacío
      if (!this.espaciosSeleccionados || this.espaciosSeleccionados.length === 0) {
        const defaultEspacio = this.espaciosStore.espacioSeleccionado();
        if (defaultEspacio) {
          this.espaciosSeleccionados = [defaultEspacio];
          this.searchForm.patchValue({ espacio: this.espaciosSeleccionados });
          this.filterCounter.update(x => x + 1);
        }
      }

      // Verificar y establecer el valor predeterminado si dep está vacío

      if (this.authService.subTipo() == 'SECTOR') {
        if (!this.sectoresSeleccionados && this.authService.sector()) {
          const defaultSector = this.authService.sector();
          if (defaultSector) {
            this.sectoresSeleccionados = [defaultSector];
            this.searchForm.patchValue({ sector: this.sectoresSeleccionados });
            this.filterCounter.update(x => x + 1);
          }
        }
      }

      if (this.authService.subTipo() == 'REGION' || this.authService.subTipo() == 'DEPARTAMENTO' || this.authService.subTipo() == 'PROVINCIA' || this.authService.subTipo() == 'DISTRITO') {
        if (!this.depSeleccionado && this.authService.departamento()) {
          const defaultDep = this.authService.departamento();
          if (defaultDep) {
            this.depSeleccionado = defaultDep;
            this.searchForm.patchValue({ dep: this.depSeleccionado });
            this.filterCounter.update(x => x + 1);
          }
        }

        if (!this.provSeleccionada && this.authService.provincia()) {
          const defaultProv = this.authService.provincia();
          if (defaultProv) {
            this.provSeleccionada = defaultProv;
            this.searchForm.patchValue({ prov: this.provSeleccionada });
            this.filterCounter.update(x => x + 1);
          }
        }
      }

      this.traerPedidos({
        pageIndex,
        pageSize,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
      });

      this.updateParamsSubject.next();
    }
  }
}
