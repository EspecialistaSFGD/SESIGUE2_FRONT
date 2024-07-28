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
import { ComentarioPedidoComponent } from '../../libs/shared/components/comentario-pedido/comentario-pedido.component';

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

  permiso: PermisoModel | null | undefined = null;
  storedPermiso = localStorage.getItem('permisos');

  departamento: SelectModel = {} as SelectModel;
  storedDepartamento = localStorage.getItem('departamento');

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
  private modal = inject(NzModalService);
  public utilesService = inject(UtilesService);
  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);


  constructor() {
    this.crearSearForm();

    try {
      this.permiso = this.storedPermiso ? JSON.parse(this.storedPermiso) : {};
      this.departamento = this.storedDepartamento ? JSON.parse(this.storedDepartamento) : {};
    } catch (e) {
      console.error('Error parsing JSON from localStorage', e);
      this.permiso = null;
      this.departamento = {} as SelectModel;
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
      sectoresSeleccionados = this.sectoresSeleccionados,
      depSeleccionado = this.depSeleccionado,
      provSeleccionada = this.provSeleccionada,
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

    const modal = this.modal.create<PedidoComponent>({
      nzTitle: title,
      nzContent: PedidoComponent,
      nzViewContainerRef: this.viewContainerRef,
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

  onGestionarPedido(id: number): void {
    if (id == null) {
      return;
    }

    //Navegar hacia la página de gestión de hitos en /acuerdos/acuerdo/:id
    this.router.navigate(['pedidos', 'pedido', id]);
  }

  onValidate(pedido: PedidoModel): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: 'Validar Pedido',
      nzContent: '¿Está seguro de validar este pedido?',
      nzOnOk: () => {
        //TODO: incluir el servicio de validar pedido
        this.pedidosService.validarPedido(pedido);
      }
    });
  }

  onCommentPCM(pedido: PedidoModel): void {
    this.pedidosService.seleccionarPedidoById(pedido.prioridadID);

    const modal = this.modal.create<ComentarioPedidoComponent>({
      nzTitle: 'Comentario PCM',
      nzContent: ComentarioPedidoComponent,
      nzViewContainerRef: this.viewContainerRef,
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
            return this.pedidosService.comentarPcmPedido(componentInstance!.comentarioPcmForm.value).then(() => {
              this.modal.closeAll();
            });
          },
          loading: this.pedidosService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.comentarioPcmForm.valid,
        }
      ]
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.comentarioPcmForm.reset();
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

    if (value != null) {
      this.ubigeosStore.listarProvincias(Number(value.value));

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

    this.searchForm.reset();

    this.cui = null;
    this.espaciosSeleccionados = [];
    this.sectoresSeleccionados = [];
    this.depSeleccionado = null;
    this.provSeleccionada = null;
    this.pageIndex = 1;
    this.pageSize = 10;

    this.filterCounter.set(0);

    // Hacer una sola llamada a traerPedidos con los parámetros vacíos
    this.traerPedidos({
      cui: null,
      espaciosSeleccionados: [],
      sectoresSeleccionados: [],
      depSeleccionado: null,
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
        queryParams: { cui: null, espacio: null, sector: null, dep: null, prov: null, pageIndex: this.pageIndex, pageSize: this.pageSize, sortField: this.sortField, sortOrder: this.sortOrder },
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
      nzOnOk: () => {
        this.pedidosService.eliminarPedido(value);
      },
    });
  }

  onOpenDrawer(): void {
    this.isDrawervisible = true;
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
      // console.log(this.utilesService.isEmptyObject(this.departamento));

      if (!this.depSeleccionado && !this.utilesService.isEmptyObject(this.departamento)) {
        const defaultDep = this.departamento;
        if (defaultDep) {
          this.depSeleccionado = defaultDep;
          this.searchForm.patchValue({ dep: this.depSeleccionado });
          this.filterCounter.update(x => x + 1);
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
