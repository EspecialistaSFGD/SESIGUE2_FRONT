import { Component, OnInit, Signal, ViewContainerRef, inject, signal } from '@angular/core';
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
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { SelectModel } from '../../libs/models/shared/select.model';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { EspaciosStore } from '../../libs/shared/stores/espacios.store';
import { SectoresStore } from '../../libs/shared/stores/sectores.store';
import { UbigeosStore } from '../../libs/shared/stores/ubigeos.store';
import { TraerAcuerdosInterface } from '../../libs/interfaces/pedido/pedido.interface';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AcuerdosService } from '../../libs/services/pedidos/acuerdos.service';
import { ClasificacionesStore } from '../../libs/shared/stores/clasificaciones.store';
import { EstadosStore } from '../../libs/shared/stores/estados.store';
import { PageHeaderComponent } from '../../libs/shared/layout/page-header/page-header.component';
import { EstadoComponent } from "../../libs/shared/components/estado/estado.component";
import { AcuerdoPedidoModel } from '../../libs/models/pedido';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AcuerdoComponent } from './acuerdo/acuerdo.component';
import { DesestimacionComponent } from '../../libs/shared/components/desestimacion/desestimacion.component';
import { ComentarioModel } from '../../libs/models/pedido/comentario.model';
import { UtilesService } from '../../libs/shared/services/utiles.service';
import { saveAs } from 'file-saver';
import { AuthService } from '../../libs/services/auth/auth.service';
import { AcuerdoType } from '../../libs/shared/types/acuerdo.type';
import { AccionType } from '../../libs/shared/types/accion.type';
import { AddEditAcuerdoModel } from '../../libs/models/shared/add-edit-acuerdo.model';
import { DueToPipe } from '../../libs/shared/pipes/due-to.pipe';

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
    EstadoComponent,
    DueToPipe,
  ],
  templateUrl: './acuerdos.component.html',
  styles: ``
})
export class AcuerdosComponent implements OnInit {
  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  // entidadSeleccionada: SelectModel = { value: 1, label: 'GOBIERNO REGIONAL DE LORETO' };
  title: string = `Lista de acuerdos y compromisos`;

  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string | null = 'acuerdoID';
  sortOrder: string | null = 'descend';
  isDrawervisible: boolean = false;

  cui: string | null = null;
  clasificacionesSeleccionadas: SelectModel[] | null = null;
  tipoSeleccionado: SelectModel | null = null;
  estadosSelecionados: SelectModel[] | null = null;
  espaciosSeleccionados: SelectModel[] | null = null;
  sectoresSeleccionados: SelectModel[] | null = null;
  depSeleccionado: SelectModel | null = null;
  provSeleccionada: SelectModel | null = null;

  filterCounter = signal<number>(0);

  private updateParamsSubject: Subject<void> = new Subject<void>();
  private updatingParams: boolean = false;
  private clearingFilters: boolean = false;
  private timeout: any;

  public acuerdosService = inject(AcuerdosService);
  private utilesService = inject(UtilesService);
  private fb = inject(UntypedFormBuilder);
  public espaciosStore = inject(EspaciosStore);
  public sectoresStore = inject(SectoresStore);
  public ubigeosStore = inject(UbigeosStore);
  public authService = inject(AuthService);
  public clasificacionesStore = inject(ClasificacionesStore);
  public estadosStore = inject(EstadosStore);

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private modal = inject(NzModalService);
  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);

  constructor() {
    this.crearSearForm();

    // Obtener los valores de los queryParams en la primera carga
    this.activatedRoute.queryParams.subscribe((params) => {
      if (!this.updatingParams) {
        if (params['cui'] != null) {
          this.cui = params['cui'];
        }

        if (params['clasificacion'] != null) {
          const selectedValues = Array.isArray(params['clasificacion']) ? params['clasificacion'] : [params['clasificacion']];
          this.clasificacionesSeleccionadas = selectedValues.map(value => ({ value: Number(value) }));
        }

        if (params['tipo'] != null) {
          this.tipoSeleccionado = { value: params['tipo'] };
        }

        if (params['estado'] != null) {
          const selectedValues = Array.isArray(params['estado']) ? params['estado'] : [params['estado']];
          this.estadosSelecionados = selectedValues.map(value => ({ value: Number(value) }));
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
          ((this.cui != undefined && this.cui != null && this.cui != '') ? 1 : 0) +
          (this.clasificacionesSeleccionadas ? this.clasificacionesSeleccionadas.length : 0) +
          (this.tipoSeleccionado ? 1 : 0) +
          (this.estadosSelecionados ? this.estadosSelecionados.length : 0) +
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
      clasificacion: this.clasificacionesSeleccionadas,
      tipo: this.tipoSeleccionado,
      estado: this.estadosSelecionados,
      espacio: this.espaciosSeleccionados,
      sector: this.sectoresSeleccionados,
      dep: this.depSeleccionado,
      prov: this.provSeleccionada,
    });
  }

  traerAcuerdos(
    {
      cui = this.cui,
      clasificacionesSeleccionadas = this.clasificacionesSeleccionadas,
      tipoSeleccionado = this.tipoSeleccionado,
      estadosSelecionados = this.estadosSelecionados,
      espaciosSeleccionados = this.espaciosSeleccionados,
      sectoresSeleccionados = (this.authService.sector() && this.authService.subTipo() != 'PCM') ? [this.authService.sector()!] : this.sectoresSeleccionados,
      depSeleccionado = (this.authService.departamento()) ? this.authService.departamento() : this.depSeleccionado,
      provSeleccionada = this.provSeleccionada,
      pageIndex = this.pageIndex,
      pageSize = this.pageSize,
      sortField = this.sortField,
      sortOrder = this.sortOrder
    }: TraerAcuerdosInterface
  ): void {
    this.acuerdosService.listarAcuerdos(cui, clasificacionesSeleccionadas, tipoSeleccionado, estadosSelecionados, espaciosSeleccionados, sectoresSeleccionados, depSeleccionado, provSeleccionada, pageIndex, pageSize, sortField, sortOrder);
  }

  onSolicitarDesestimacion(acuerdo: AcuerdoPedidoModel): void {
    const title = 'Solicitar desestimación de acuerdo';
    const labelOK = 'Solicitar desestimación';

    const modal = this.modal.create<DesestimacionComponent, ComentarioModel>({
      nzTitle: title,
      nzContent: DesestimacionComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzClosable: false,
      nzMaskClosable: false,
      nzData: {
        id: acuerdo.acuerdoId,
        tipo: 'ACUERDO',
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: labelOK,
          type: 'primary',
          danger: true,
          onClick: (componentInstance) => {
            return this.acuerdosService.solicitarDesestimacionAcuerdo(componentInstance!.desestimacionForm.value).then((res) => {
              this.traerAcuerdos({

              });
              this.modal.closeAll();
            });
          },
          loading: this.acuerdosService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.desestimacionForm.valid,
        }
      ]
    });

    const instance = modal.getContentComponent();
    //modal.afterOpen.subscribe(() => console.log(instance.hitoForm.value));
    // Return a result when closed
    modal.afterClose.subscribe(result => {
      instance.desestimacionForm.reset();
    });
  }

  onVerDesestimacion(acuerdo: AcuerdoPedidoModel): void {
    if (acuerdo == null) return;

    this.acuerdosService.descargarEvidenciaDesestimacion(acuerdo.acuerdoId!).then((res) => {
      if (res.success == true) {
        var binary_string = this.utilesService.base64ToArrayBuffer(res.data[0].binario);
        var blob = new Blob([binary_string], { type: `application/${res.data[0].tipo}` });

        saveAs(blob, res.data[0].nombre);
      }
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
    this.traerAcuerdos({ espaciosSeleccionados: value });

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
    this.traerAcuerdos({ sectoresSeleccionados: value });

    this.filterCounter.update(x => x + (newSelectedCount - prevSelectedCount));

    this.updateParamsSubject.next();
  }

  onDepChange(value: SelectModel, skipNavigation = false): void {
    if (this.clearingFilters) {
      return;
    }

    const wasPreviouslySelected = this.depSeleccionado != null;

    this.depSeleccionado = value;
    this.traerAcuerdos({ depSeleccionado: value });

    if (value != null && value.value) {
      this.ubigeosStore.listarProvincias(value.value.toString());

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
    this.traerAcuerdos({ provSeleccionada: value });

    if (value == null && wasPreviouslySelected) {
      this.filterCounter.update(x => x - 1);
    } else if (value != null && !wasPreviouslySelected) {
      this.filterCounter.update(x => x + 1);
    }

    this.updateParamsSubject.next();
  }

  onClasificacionAcuerdosChange(value: SelectModel[] | null) {
    if (this.clearingFilters) {
      return;
    }

    value = value || [];

    const prevSelectedCount = this.clasificacionesSeleccionadas ? this.clasificacionesSeleccionadas.length : 0;
    const newSelectedCount = value.length;

    this.clasificacionesSeleccionadas = value;
    this.traerAcuerdos({ clasificacionesSeleccionadas: value });

    this.filterCounter.update(x => x + (newSelectedCount - prevSelectedCount));

    this.updateParamsSubject.next();
  }

  onTipoAcuerdosChange(value: any) {
    console.log('onTipoAcuerdosChange', { value });

    if (this.clearingFilters) {
      return;
    }

    const wasPreviouslySelected = this.tipoSeleccionado != null;
    if (value == null) {
      this.tipoSeleccionado = null;
    } else {
      this.tipoSeleccionado = { value };
    }
    this.traerAcuerdos({ tipoSeleccionado: this.tipoSeleccionado });

    if (value == null && wasPreviouslySelected) {
      this.filterCounter.update(x => x - 1);
    } else if (value != null && !wasPreviouslySelected) {
      this.filterCounter.update(x => x + 1);
    }

    this.updateParamsSubject.next();
  }

  onEstadoAcuerdosChange(value: SelectModel[]) {
    if (this.clearingFilters) {
      return;
    }

    value = value || [];

    const prevSelectedCount = this.estadosSelecionados ? this.estadosSelecionados.length : 0;
    const newSelectedCount = value.length;

    this.estadosSelecionados = value;
    this.traerAcuerdos({ estadosSelecionados: value });

    this.filterCounter.update(x => x + (newSelectedCount - prevSelectedCount));

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
    this.cui = (value == null || value == '' || value == undefined) ? null : value;
    this.traerAcuerdos({ cui: value });
    this.updateParamsSubject.next();
  }

  updateQueryParams() {
    this.updatingParams = true;

    const queryParams = {
      cui: this.cui,
      clasificacion: this.clasificacionesSeleccionadas ? this.clasificacionesSeleccionadas.map(x => x.value) : null,
      tipo: this.tipoSeleccionado ? this.tipoSeleccionado.value : null,
      estado: this.estadosSelecionados ? this.estadosSelecionados.map(x => x.value) : null,
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
    this.clasificacionesSeleccionadas = [];
    this.tipoSeleccionado = null;
    this.estadosSelecionados = [];
    this.espaciosSeleccionados = [];
    this.sectoresSeleccionados = [];
    this.depSeleccionado = null;
    this.provSeleccionada = null;
    this.pageIndex = 1;
    this.pageSize = 10;

    this.filterCounter.set(0);

    // Hacer una sola llamada a traerAcuerdos con los parámetros vacíos
    this.traerAcuerdos({
      cui: null,
      clasificacionesSeleccionadas: [],
      tipoSeleccionado: null,
      estadosSelecionados: [],
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
        queryParams: { cui: null, clasificacion: null, tipo: null, estado: null, espacio: null, sector: null, dep: null, prov: null, pageIndex: this.pageIndex, pageSize: this.pageSize, sortField: this.sortField, sortOrder: this.sortOrder },
        queryParamsHandling: 'merge',
      }
    ).finally(() => {
      this.clearingFilters = false;
    });
  }

  onGestionarHitoAcuerdo(codigo: number): void {
    if (codigo == null) {
      return;
    }

    //Navegar hacia la página de gestión de hitos en /acuerdos/acuerdo/:codigo
    this.router.navigate(['acuerdos', 'acuerdo', codigo]);
  }

  onAddEdit(acuerdo: AcuerdoPedidoModel | null, tipo: AcuerdoType, accion: AccionType): void {
    const title = 'Nuevo acuerdo';
    const labelOk = 'Crear';

    // this.acuerdosService.seleccionarAcuerdoById(acuerdo?.acuerdoId || null);
    this.espaciosStore.listarEventos();

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
            return this.acuerdosService.agregarAcuerdo(componentInstance!.acuerdoForm.value).then((res) => {
              // this.traerAcuerdos({});
              this.modal.closeAll();
            });
          },
          loading: this.acuerdosService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.acuerdoForm.valid,
        }
      ]
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.acuerdoForm.reset();
    });
  }

  onDelete(value: any): void { }

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
      clasificacion: [null],
      tipo: [null],
      estado: [null],
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

      this.traerAcuerdos({
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
