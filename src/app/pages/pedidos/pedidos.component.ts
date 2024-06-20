import { Component, OnInit, Signal, inject, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { PageHeaderComponent } from '../../shared/layout/page-header/page-header.component';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { EstadoComponent } from '../../shared/components/estado/estado.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzCardModule } from 'ng-zorro-antd/card';
import { AnchorModel } from '../../libs/models/shared/anchor.model';
import { PedidosService } from '../../libs/services/pedidos/pedidos.service';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { SelectModel } from '../../libs/models/shared/select.model';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { EspaciosStore } from '../../libs/stores/shared/espacios.store';
import { SectoresStore } from '../../libs/stores/shared/sectores.store';
import { UbigeosStore } from '../../libs/stores/shared/ubigeos.store';
import { TraerPedidosInterface } from '../../libs/interfaces/pedido/pedido.interface';

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
    NzDatePickerModule,
    NzInputModule,
    NzIconModule,
    EstadoComponent,
    NzButtonModule,
    NzSpaceModule,
    NzCardModule,
    NzDropDownModule,
    NzDrawerModule,
    NzBadgeModule,
  ],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.less'
})
export class PedidosComponent implements OnInit {
  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  entidadSeleccionada: SelectModel = { value: 1, label: 'GOBIERNO REGIONAL DE LORETO' };
  title: string = `Lista de pedidos de ${this.entidadSeleccionada.label}`;

  pageIndex: number | null = 1;
  pageSize: number | null = 10;
  total: number | null = 0;
  sortField: string | null = 'prioridadID';
  sortOrder: string | null = 'descend';
  isDrawervisible: boolean = false;

  espaciosSeleccionados: SelectModel[] | null = null;
  sectoresSeleccionados: SelectModel[] | null = null;
  depSeleccionado: SelectModel | null = null;
  provSeleccionada: SelectModel | null = null;
  filterCounter = signal<number>(0);

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
        this.onDepChange(this.depSeleccionado);
      }

      if (params['prov'] != null) {
        this.provSeleccionada = { value: Number(params['prov']) };
      }

      // Inicializar el contador con la suma de las selecciones iniciales
      this.filterCounter.set(
        (this.espaciosSeleccionados ? this.espaciosSeleccionados.length : 0) +
        (this.sectoresSeleccionados ? this.sectoresSeleccionados.length : 0) +
        (this.depSeleccionado ? 1 : 0) +
        (this.provSeleccionada ? 1 : 0)
      );
    });
  }

  ngOnInit(): void {
    this.searchForm.patchValue({
      espacio: this.espaciosSeleccionados,
      sector: this.sectoresSeleccionados,
      dep: this.depSeleccionado,
      prov: this.provSeleccionada,
    });
  }

  traerPedidos(
    {
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
    this.pedidosService.listarPedidos(espaciosSeleccionados, sectoresSeleccionados, depSeleccionado, provSeleccionada, pageIndex, pageSize, sortField, sortOrder);
  }

  onEspacioChange(value: SelectModel[]): void {
    // Obtener la longitud de las selecciones anteriores y actuales
    const prevSelectedCount = this.espaciosSeleccionados ? this.espaciosSeleccionados.length : 0;
    const newSelectedCount = value.length;

    // Actualiza la lista de espacios seleccionados
    this.espaciosSeleccionados = value;
    this.traerPedidos({ espaciosSeleccionados: value });

    // Actualizar el contador según la diferencia entre las selecciones anteriores y actuales
    this.filterCounter.update(x => x + (newSelectedCount - prevSelectedCount));

    // Construir la lista de valores seleccionados
    const selectedValues = value.map(x => x.value);

    // Actualizar la URL con los espacios seleccionados
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { 'espacio': selectedValues.length ? selectedValues : null },
        queryParamsHandling: 'merge',
      }
    );
  }

  onSectorChange(value: SelectModel[]): void {
    // Obtener la longitud de las selecciones anteriores y actuales
    const prevSelectedCount = this.sectoresSeleccionados ? this.sectoresSeleccionados.length : 0;
    const newSelectedCount = value.length;

    // Actualiza la lista de sectores seleccionados
    this.sectoresSeleccionados = value;
    this.traerPedidos({ sectoresSeleccionados: value });

    // Actualizar el contador según la diferencia entre las selecciones anteriores y actuales
    this.filterCounter.update(x => x + (newSelectedCount - prevSelectedCount));

    // Construir la lista de valores seleccionados
    const selectedValues = value.map(x => x.value);

    // Actualizar la URL con los sectores seleccionados
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { 'sector': selectedValues.length ? selectedValues : null },
        queryParamsHandling: 'merge',
      }
    );
  }

  onDepChange(value: SelectModel): void {
    // Obtener el estado anterior del departamento seleccionado
    // this.provSeleccionada = null;
    const wasPreviouslySelected = this.depSeleccionado != null;

    // Actualizar el departamento seleccionado
    this.depSeleccionado = value;
    this.traerPedidos({ depSeleccionado: value });

    // Listar provincias desde el store si se selecciona un departamento
    if (value != null) {
      this.ubigeosStore.listarProvincias(Number(value.value));
    }

    // Actualizar el contador
    if (value == null && wasPreviouslySelected) {
      // Se deseleccionó un departamento
      this.filterCounter.update(x => x - 1);
    } else if (value != null && !wasPreviouslySelected) {
      // Se seleccionó un nuevo departamento
      this.filterCounter.update(x => x + 1);
    }

    // Actualizar la URL con el departamento seleccionado
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { dep: value ? value.value : null },
        queryParamsHandling: 'merge',
      }
    );
  }

  onProvChange(value: SelectModel): void {
    // Obtener el estado anterior de la provincia seleccionada
    const wasPreviouslySelected = this.provSeleccionada != null;

    // Actualizar la provincia seleccionada
    this.provSeleccionada = value;
    this.traerPedidos({ provSeleccionada: value });

    // Actualizar el contador
    if (value == null && wasPreviouslySelected) {
      // Se deseleccionó una provincia
      this.filterCounter.update(x => x - 1);
    } else if (value != null && !wasPreviouslySelected) {
      // Se seleccionó una nueva provincia
      this.filterCounter.update(x => x + 1);
    }

    // Actualizar la URL con la provincia seleccionada
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { prov: value ? value.value : null },
        queryParamsHandling: 'merge',
      }
    );
  }


  onClearFilters(): void {
    this.searchForm.reset();

    this.espaciosSeleccionados = null;
    this.sectoresSeleccionados = null;
    this.depSeleccionado = null;
    this.provSeleccionada = null;

    this.filterCounter.set(0);

    this.traerPedidos({
      espaciosSeleccionados: null,
      sectoresSeleccionados: null,
      depSeleccionado: null,
      provSeleccionada: null,
    });

    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { espacio: null, sector: null, dep: null, prov: null },
        queryParamsHandling: 'merge',
      }
    );
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
      espacio: [null],
      sector: [null],
      dep: [null],
      prov: [null],
    });
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort } = params;
    const currentSort = sort.find(item => item.value !== null);
    const sortField = (currentSort && currentSort.key) || this.sortField;
    const sortOrder = (currentSort && currentSort.value) || this.sortOrder;

    this.traerPedidos({
      pageIndex,
      pageSize,
      sortField,
      sortOrder
    });
  }
}
