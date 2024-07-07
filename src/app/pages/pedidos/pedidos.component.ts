import { Component, OnInit, Signal, inject, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { PageHeaderComponent } from '../../shared/layout/page-header/page-header.component';
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
import { EspaciosStore } from '../../libs/stores/shared/espacios.store';
import { SectoresStore } from '../../libs/stores/shared/sectores.store';
import { UbigeosStore } from '../../libs/stores/shared/ubigeos.store';
import { TraerPedidosInterface } from '../../libs/interfaces/pedido/pedido.interface';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
  styleUrl: './pedidos.component.less'
})
export class PedidosComponent implements OnInit {
  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  entidadSeleccionada: SelectModel = { value: 1, label: 'GOBIERNO REGIONAL DE LORETO' };
  title: string = `Lista de pedidos de ${this.entidadSeleccionada.label}`;

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

  constructor() {
    this.crearSearForm();

    // Obtener los valores de los queryParams en la primera carga
    this.activatedRoute.queryParams.subscribe((params) => {
      if (!this.updatingParams) {
        if (params['cui'] != null) {
          this.cui = params['cui'];
        }

        if (params['espacio'] != null) {
          const selectedValues = Array.isArray(params['espacio']) ? params['espacio'] : [params['espacio']];
          this.espaciosSeleccionados = selectedValues.map(value => ({ value: Number(value) }));
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

  onDelete(value: any): void { }

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

      this.traerPedidos({
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
