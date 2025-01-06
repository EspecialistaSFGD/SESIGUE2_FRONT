import { Component, inject, signal, ViewContainerRef } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { UtilesService } from '../../libs/shared/services/utiles.service';
import { AuthService } from '../../libs/services/auth/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SelectModel } from '../../libs/models/shared/select.model';
import { TraerHitosListadoInterface } from '../../libs/interfaces/acuerdo/acuerdo.interface';
import { HitosService } from '../../libs/services/pedidos/hitos.service';
import { EspaciosStore } from '../../libs/shared/stores/espacios.store';
import { UbigeosStore } from '../../libs/shared/stores/ubigeos.store';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../libs/shared/layout/page-header/page-header.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { EstadoComponent } from '../../libs/shared/components/estado/estado.component';
import { DueToPipe } from '../../libs/shared/pipes/due-to.pipe';
import { ClasificacionesStore } from '../../libs/shared/stores/clasificaciones.store';
import { EstadosStore } from '../../libs/shared/stores/estados.store';
import { SectoresStore } from '../../libs/shared/stores/sectores.store';
import { AvanceHitoModel, HitoAcuerdoModel } from '../../libs/models/pedido';
import { saveAs } from 'file-saver';
import { AcuerdosService } from '../../libs/services/pedidos/acuerdos.service';
import { ComentarioComponent } from '../../libs/shared/components/comentario/comentario.component';
import { ComentarioModel } from '../../libs/models/pedido/comentario.model';
import { AvancesService } from '../../libs/services/pedidos/avances.service';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { ReporteType } from '../../libs/shared/types/reporte.type';
import { ReporteDescargaComponent } from '../../libs/shared/components/reporte-descarga/reporte-descarga.component';
import { ReportesService } from '../../libs/shared/services/reportes.service';

const subTipo = localStorage.getItem('subTipo')?.toUpperCase() || null;


@Component({
  selector: 'app-hitos',
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
    NzPopoverModule,
    NzAvatarModule,
    EstadoComponent,
    DueToPipe,
    NzModalModule
  ],
  templateUrl: './hitos.component.html',
  styles: ``
})
export class HitosComponent {
  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  title: string = `Lista de Hitos`;

  loading: boolean = false;
  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string = 'hitoId';
  sortOrder: string = 'descend';
  isDrawervisible: boolean = false;
  isVisible: boolean = false;

  cui: string | null = null;
  clasificacionesSeleccionadas: SelectModel[] | null = null;
  tipoSeleccionado: string | null = null;
  estadosSelecionados: SelectModel[] | null = null;
  espaciosSeleccionados: SelectModel[] | null = null;
  tipoEspacioSeleccionado: SelectModel | null = null;
  sectoresSeleccionados: SelectModel[] | null = null;
  depSeleccionado: SelectModel | null = null;
  provSeleccionada: SelectModel | null = null;
  disSeleccionado: SelectModel | null = null;

  filterCounter = signal<number>(0);

  private cargandoUbigeo: boolean = false; // Variable de control para evitar llamadas múltiples

  private updateParamsSubject: Subject<void> = new Subject<void>();
  private updatingParams: boolean = false;
  private clearingFilters: boolean = false;
  private timeout: any;

  private utilesService = inject(UtilesService);
  private fb = inject(UntypedFormBuilder);
  public authService = inject(AuthService);
  public hitosService = inject(HitosService);
  public espaciosStore = inject(EspaciosStore);
  public ubigeosStore = inject(UbigeosStore);
  public clasificacionesStore = inject(ClasificacionesStore);
  public estadosStore = inject(EstadosStore);
  public sectoresStore = inject(SectoresStore);

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private modal = inject(NzModalService);
  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);
  private acuerdosService = inject(AcuerdosService);
  private avancesService = inject(AvancesService);
  private reportesService = inject(ReportesService);

  constructor() {
    this.crearSearForm();

    const savedParams = localStorage.getItem('hitosParams');

    if (savedParams) {
      // Si ya hay parámetros guardados en localStorage, los cargamos
      const paramsFromStorage = JSON.parse(savedParams);
      this.cargarParametrosDesdeLocalStorage(paramsFromStorage);
    } else {
      // Si no hay parámetros guardados en el localStorage, continuar con la lógica normal
      this.activatedRoute.queryParams.subscribe((params) => {
        // this.cargarParametrosDesdeURL(params);
      });
    }

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
      tipoEspacio: this.tipoEspacioSeleccionado,
      espacio: this.espaciosSeleccionados,
      sector: this.sectoresSeleccionados,
      dep: this.depSeleccionado,
      prov: this.provSeleccionada,
      dis: this.disSeleccionado,
    });
  }

  traerHitos(
    {
      cui = this.cui,
      clasificacionesSeleccionadas = this.clasificacionesSeleccionadas,
      tipoSeleccionado = this.tipoSeleccionado,
      tipoEspacioSeleccionado = this.tipoEspacioSeleccionado,
      estadosSelecionados = this.estadosSelecionados,
      espaciosSeleccionados = this.espaciosSeleccionados,
      sectoresSeleccionados = (this.authService.sector() && this.authService.subTipo() != 'PCM') ? [this.authService.sector()!] : this.sectoresSeleccionados,
      depSeleccionado = (this.authService.departamento()) ? this.authService.departamento() : this.depSeleccionado,
      provSeleccionada = (this.authService.provincia()) ? this.authService.provincia() : this.provSeleccionada,
      disSeleccionado = (this.authService.distrito()) ? this.authService.distrito() : this.disSeleccionado,
      pageIndex = this.pageIndex,
      pageSize = this.pageSize,
      sortField = this.sortField,
      sortOrder = this.sortOrder
    }: TraerHitosListadoInterface
  ): void {
    if (!this.cargandoUbigeo) { // Solo llamar al servicio si no estamos cargando ubigeo
      let tipoEspacio: string | null = null
      if(tipoEspacioSeleccionado){
        tipoEspacio = this.espaciosStore.tiposEspacio().find(item => item.value == tipoEspacioSeleccionado.value)?.label!;
      }
      this.hitosService.listarHitosGenerales(cui, clasificacionesSeleccionadas, tipoSeleccionado, estadosSelecionados, tipoEspacio, espaciosSeleccionados, sectoresSeleccionados, depSeleccionado, provSeleccionada, disSeleccionado, pageIndex, pageSize, sortField, sortOrder);
    }
  }

  onAvanceAddComentario(avance: AvanceHitoModel): void {
    if (avance == null) return;

    let tipoCompentario: number | null = null;

    switch (subTipo) {

      case 'PCM':
        tipoCompentario = 1;
        break;
      case 'SECTOR':
        tipoCompentario = 2;
        break;
      case 'PROVINCIA':
        tipoCompentario = 3;
        break;
      case 'EJECUTORA':
        tipoCompentario = 4;
        break;
      default:
        tipoCompentario = null;
        break;
    }

    this.avancesService.seleccionarAvanceById(avance.avanceId);

    const modal = this.modal.create<ComentarioComponent, ComentarioModel>({
      nzTitle: `Comentario para el avance`,
      nzContent: ComentarioComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        id: avance.avanceId || null,
        tipo: 'AVANCE',
        tipoComentario: tipoCompentario,
      },
      nzMaskClosable: false,
      nzClosable: false,
      nzKeyboard: false,
      nzFooter: [
        {
          label: 'Cancelar',
          onClick: () => this.modal.closeAll()
        },
        {
          type: 'primary',
          label: 'Comentar',
          onClick: componentInstance => {
            return this.avancesService.agregarComentarioDesdeListadoHitos(componentInstance!.comentarioForm.value).then((res) => {
              this.traerHitos({});
              this.modal.closeAll();
            });
          },
          loading: this.avancesService.isEditing(),
          disabled: componentInstance => !componentInstance || !componentInstance.comentarioForm.valid
        }]
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.comentarioForm.reset();
    });
  }

  onRefresh(): void {
    this.traerHitos({});
  }

  cargarParametrosDesdeLocalStorage(params: any): void {
    if (!this.updatingParams) {
      this.cargandoUbigeo = true;

      this.cui = params.cui || null;
      this.clasificacionesSeleccionadas = params.clasificacion && params.clasificacion.length ? params.clasificacion.map((value: number) => ({ value })) : [];
      this.tipoSeleccionado = params.tipo ? params.tipo : null;
      this.estadosSelecionados = params.estado && params.estado.length ? params.estado.map((value: number) => ({ value })) : [];
      this.tipoEspacioSeleccionado = params.tipoEspacio ? { value: params.tipoEspacio } : null;
      this.espaciosSeleccionados = params.espacio && params.espacio.length ? params.espacio.map((value: number) => ({ value })) : [];
      this.sectoresSeleccionados = params.sector && params.sector.length ? params.sector.map((value: number) => ({ value })) : [];
      this.depSeleccionado = params.dep ? { value: params.dep } : null;
      this.provSeleccionada = params.prov ? { value: params.prov } : null;
      this.disSeleccionado = params.dis ? { value: params.dis } : null;
      this.pageIndex = params.pageIndex || 1;
      this.pageSize = params.pageSize || 10;
      this.sortField = params.sortField || 'acuerdoID';
      this.sortOrder = params.sortOrder || 'descend';

      // Actualizar el contador de filtros activos
      this.filterCounter.set(
        ((this.cui != undefined && this.cui != null && this.cui != '') ? 1 : 0) +
        (this.clasificacionesSeleccionadas?.length ? this.clasificacionesSeleccionadas.length : 0) +
        (this.tipoSeleccionado ? 1 : 0) +
        (this.estadosSelecionados?.length ? this.estadosSelecionados.length : 0) +
        (this.tipoEspacioSeleccionado ? 1 : 0) +
        (this.espaciosSeleccionados?.length ? this.espaciosSeleccionados.length : 0) +
        (this.sectoresSeleccionados?.length ? this.sectoresSeleccionados.length : 0) +
        (this.depSeleccionado ? 1 : 0) +
        (this.provSeleccionada ? 1 : 0) +
        (this.disSeleccionado ? 1 : 0)
      );

      this.cargandoUbigeo = false;
    }
  }

  // cargarParametrosDesdeURL(params: any): void {
  //   if (!this.updatingParams) {
  //     this.cargandoUbigeo = true; // Iniciar la carga de ubigeo

  //     if (params['cui'] != null) {
  //       this.cui = params['cui'];
  //     }

  //     if (params['clasificacion'] != null) {
  //       const selectedValues = Array.isArray(params['clasificacion']) ? params['clasificacion'] : [params['clasificacion']];
  //       this.clasificacionesSeleccionadas = selectedValues.map(value => ({ value: Number(value) }));
  //     }

  //     if (params['tipo'] != null) {
  //       this.tipoSeleccionado = { value: params['tipo'] };
  //     }

  //     if (params['estado'] != null) {
  //       const selectedValues = Array.isArray(params['estado']) ? params['estado'] : [params['estado']];
  //       this.estadosSelecionados = selectedValues.map(value => ({ value: Number(value) }));
  //     }

  //     if (params['tipoEspacio'] != null) {
  //       this.tipoEspacioSeleccionado = { value: Number(params['tipoEspacio']) };
  //       this.onTipoEspacioChange(this.tipoEspacioSeleccionado, true);
  //     }

  //     if (params['espacio'] != null) {
  //       const selectedValues = Array.isArray(params['espacio']) ? params['espacio'] : [params['espacio']];
  //       this.espaciosSeleccionados = selectedValues.map(value => ({ value: Number(value) }));
  //     }

  //     if (params['sector'] != null) {
  //       const selectedValues = Array.isArray(params['sector']) ? params['sector'] : [params['sector']];
  //       this.sectoresSeleccionados = selectedValues.map(value => ({ value: Number(value) }));
  //     }

  //     if (params['dep'] != null) {
  //       this.depSeleccionado = { value: params['dep'] };
  //       this.onDepChange(this.depSeleccionado, true); // true indica que no se debe volver a navegar
  //     }

  //     if (params['prov'] != null) {
  //       this.provSeleccionada = { value: params['prov'] };
  //       this.onProvChange(this.provSeleccionada, true);
  //     }

  //     if (params['dis'] != null) {
  //       this.disSeleccionado = { value: params['dis'] };
  //     }

  //     if (params['pageIndex'] != null) {
  //       this.pageIndex = Number(params['pageIndex']);
  //     }

  //     if (params['pageSize'] != null) {
  //       this.pageSize = Number(params['pageSize']);
  //     }

  //     if (params['sortField'] != null) {
  //       this.sortField = params['sortField'];
  //     }

  //     if (params['sortOrder'] != null) {
  //       this.sortOrder = params['sortOrder'];
  //     }

  //     // Inicializar el contador con la suma de las selecciones iniciales
  //     this.filterCounter.set(
  //       ((this.cui != undefined && this.cui != null && this.cui != '') ? 1 : 0) +
  //       (this.clasificacionesSeleccionadas ? this.clasificacionesSeleccionadas.length : 0) +
  //       (this.tipoSeleccionado ? 1 : 0) +
  //       (this.estadosSelecionados ? this.estadosSelecionados.length : 0) +
  //       (this.tipoEspacioSeleccionado ? 1 : 0) +
  //       (this.espaciosSeleccionados ? this.espaciosSeleccionados.length : 0) +
  //       (this.sectoresSeleccionados ? this.sectoresSeleccionados.length : 0) +
  //       (this.depSeleccionado ? 1 : 0) +
  //       (this.provSeleccionada ? 1 : 0) +
  //       (this.disSeleccionado ? 1 : 0)
  //     );

  //     this.cargandoUbigeo = false; // Finalizar la carga de ubigeo
  //   }
  // }

  onOpenDrawer(): void {
    this.isDrawervisible = true;
  }

  onCloseDrawer(): void {
    this.isDrawervisible = false;
  }

  onTipoEspacioChange(value: SelectModel | null, skipNavigation = false): void {
    if (this.clearingFilters) {
      return;
    }

    const wasPreviouslySelected = this.tipoEspacioSeleccionado != null;

    this.tipoEspacioSeleccionado = value;
    // this.traerHitos({ tipoEspacioSeleccionado: value });
    // debugger;
    if (value != null) {
      // this.espaciosStore.limpiarEspacios();
      this.espaciosStore.listarEventos(Number(value.value));


      if (this.espaciosSeleccionados != null) {
        this.espaciosSeleccionados = null;
        this.searchForm.patchValue({ espacio: null });
        this.filterCounter.update(x => x - 1);
      }
    } else {
      this.onEspacioChange(null);
    }

    if (value == null && wasPreviouslySelected) {
      this.filterCounter.update(x => x - 1);
    } else if (value != null && !wasPreviouslySelected) {
      this.filterCounter.update(x => x + 1);
    }

    if (!this.cargandoUbigeo && !skipNavigation) {
      // this.traerHitos({});
      this.updateParamsSubject.next();
    }
  }

  onEspacioChange(value: SelectModel[] | null): void {
    if (this.clearingFilters) {
      return;
    }

    value = value || [];

    const prevSelectedCount = this.espaciosSeleccionados ? this.espaciosSeleccionados.length : 0;
    const newSelectedCount = value.length;

    this.espaciosSeleccionados = value;
    this.traerHitos({ espaciosSeleccionados: value });

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
    this.traerHitos({ sectoresSeleccionados: value });

    this.filterCounter.update(x => x + (newSelectedCount - prevSelectedCount));

    this.updateParamsSubject.next();
  }

  onDepChange(value: SelectModel, skipNavigation = false): void {
    if (this.clearingFilters) {
      return;
    }

    const wasPreviouslySelected = this.depSeleccionado != null;

    this.depSeleccionado = value;
    this.traerHitos({ depSeleccionado: value });

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

    if (!this.cargandoUbigeo && !skipNavigation) {
      this.traerHitos({});
      this.updateParamsSubject.next();
    }
  }

  onProvChange(value: SelectModel, skipNavigation = false): void {
    if (this.clearingFilters) {
      return;
    }

    const wasPreviouslySelected = this.provSeleccionada != null;

    this.provSeleccionada = value;

    if (value && value.value) {
      this.ubigeosStore.listarDistritos(value.value?.toString());

      if (this.disSeleccionado != null) {
        this.disSeleccionado = null;
        this.searchForm.patchValue({ dis: null });
        this.filterCounter.update(x => x - 1);
      }
    }

    if (value == null && wasPreviouslySelected) {
      this.filterCounter.update(x => x - 1);
    } else if (value != null && !wasPreviouslySelected) {
      this.filterCounter.update(x => x + 1);
    }

    if (!this.cargandoUbigeo && !skipNavigation) {
      this.traerHitos({});
      this.updateParamsSubject.next();
    }
  }

  onDisChange(value: SelectModel): void {

    if (this.clearingFilters) {
      return;
    }

    const wasPreviouslySelected = this.disSeleccionado != null;
    this.disSeleccionado = value;

    if (value == null && wasPreviouslySelected) {
      this.filterCounter.update(x => x - 1);
    } else if (value != null && !wasPreviouslySelected) {
      this.filterCounter.update(x => x + 1);
    }

    // Solo llamar a traerPedidos si cargandoUbigeo es false
    if (!this.cargandoUbigeo) {
      this.traerHitos({});
      this.updateParamsSubject.next();
    }
  }

  onClasificacionAcuerdosChange(value: SelectModel[] | null) {
    if (this.clearingFilters) {
      return;
    }

    value = value || [];

    const prevSelectedCount = this.clasificacionesSeleccionadas ? this.clasificacionesSeleccionadas.length : 0;
    const newSelectedCount = value.length;

    this.clasificacionesSeleccionadas = value;
    this.traerHitos({ clasificacionesSeleccionadas: value });

    this.filterCounter.update(x => x + (newSelectedCount - prevSelectedCount));

    this.updateParamsSubject.next();
  }

  onTipoAcuerdosChange(value: any) {
    if (this.clearingFilters) {
      return;
    }

    const wasPreviouslySelected = this.tipoSeleccionado != null;
    if (value == null) {
      this.tipoSeleccionado = null;
    } else {
      this.tipoSeleccionado = value;
    }
    this.traerHitos({ tipoSeleccionado: this.tipoSeleccionado });

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
    this.traerHitos({ estadosSelecionados: value });

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
    this.traerHitos({ cui: value });
    this.updateParamsSubject.next();
  }

  onGestionarHitoAcuerdo(codigo: number): void {
    if (codigo == null) {
      return;
    }

    //Navegar hacia la página de gestión de hitos en /acuerdos/acuerdo/:codigo
    this.router.navigate(['acuerdos', 'acuerdo', codigo]);
  }

  onVerDesestimacion(acuerdo: HitoAcuerdoModel): void {
    if (acuerdo == null) return;

    this.acuerdosService.descargarEvidenciaDesestimacion(acuerdo.acuerdoID!).then((res) => {
      if (res.success == true) {
        var binary_string = this.utilesService.base64ToArrayBuffer(res.data[0].binario);
        var blob = new Blob([binary_string], { type: `application/${res.data[0].tipo}` });

        saveAs(blob, res.data[0].nombre);
      }
    });
  }

  onValidarAvance(avance: AvanceHitoModel): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: `¿Deseas validar el avance: "${avance.avance}"?`,
      nzContent: 'El avance pasará a estar VALIDADO.',
      nzIconType: 'check-circle',
      nzOnOk: () => this.avancesService.validarAvance(avance)
    });
  }

  generarExcel(archivo: any, nombreArchivo: string): void {
    const arrayBuffer = this.utilesService.base64ToArrayBuffer(archivo);
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, nombreArchivo);
  }

  onDescargarReporte(tipo: ReporteType): void {
    const cui: string | null = this.cui ? this.cui : null
    const sectores: number[] | null = this.sectoresSeleccionados ? this.sectoresSeleccionados!.map(item => Number(item.value)) : null
    const espacios: number[] | null = this.espaciosSeleccionados ? this.espaciosSeleccionados!.map(item => Number(item.value)) : null
    const estados: number[] | null = this.estadosSelecionados ? this.estadosSelecionados!.map(item => Number(item.value)) : null
    const clasificaciones: number[] | null = this.clasificacionesSeleccionadas ? this.clasificacionesSeleccionadas!.map(item => Number(item.value)) : null
    const tipos: number | null = this.tipoSeleccionado ? Number(this.tipoSeleccionado) : null
    
    let ubigeo: string | null = this.depSeleccionado ? `${this.depSeleccionado.value}` : null
    ubigeo = this.provSeleccionada ? `${this.provSeleccionada.value}` : ubigeo
    ubigeo = this.disSeleccionado ? `${this.disSeleccionado.value}` : ubigeo
    let tipoEspacio: string | null = null
    if(this.tipoEspacioSeleccionado){
      tipoEspacio = this.espaciosStore.tiposEspacio().find(item => item.value == this.tipoEspacioSeleccionado?.value)?.label!;
    }

    this.loading = true

    let sortField = 'prioridadID'
    switch (tipo) {
      case 'ACUERDO': sortField = 'acuerdoId'; break;
      case 'HITO': sortField = 'hitoId'; break;
    }

    this.reportesService.descargarReporteAcuerdos(tipo, this.pageIndex, 0, sortField, this.sortOrder, sectores, tipoEspacio, espacios, ubigeo, cui, estados, clasificaciones, tipos)
      .then((res) => {
        if (res.success == true) {
          this.generarExcel(res.data.archivo, res.data.nombreArchivo);
          this.loading = false
        }
      })
  }

  // onDescargarReporte(tipo: ReporteType): void {
  //   const modal = this.modal.create<ReporteDescargaComponent, ReporteType>({
  //     nzTitle: `Descargando reporte de ${tipo}`,
  //     nzContent: ReporteDescargaComponent,
  //     nzViewContainerRef: this.viewContainerRef,
  //     nzData: tipo,
  //     nzMaskClosable: false,
  //     nzClosable: false,
  //     nzKeyboard: false,
  //     nzFooter: [
  //       {
  //         label: 'Cancelar',
  //         onClick: () => this.modal.closeAll()
  //       },
  //       {
  //         type: 'primary',
  //         label: 'Descargar',
  //         onClick: componentInstance => {
  //           const page = (componentInstance!.reporteDescargaForm.value.esDescargaTotal) ? 0 : this.pageSize;

  //           if (tipo == 'ACUERDO') {

  //             return this.reportesService.descargarReporteAcuerdos(
  //               tipo,
  //               this.pageIndex, page, 'PrioridadId', this.sortOrder
  //             ).then((res) => {

  //               if (res.success == true) {
  //                 var arrayBuffer = this.utilesService.base64ToArrayBuffer(res.data.archivo);
  //                 var blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  //                 saveAs(blob, res.data.nombreArchivo);
  //               }

  //               this.modal.closeAll();
  //             });
  //           }

  //           return;
  //         },
  //         loading: this.reportesService.isLoading(),
  //         disabled: componentInstance => !componentInstance || !componentInstance.reporteDescargaForm.valid
  //       }]
  //   });

  //   const instance = modal.getContentComponent();

  //   modal.afterClose.subscribe(() => {
  //     instance.reporteDescargaForm.reset();
  //   });
  // }

  updateQueryParams() {
    this.updatingParams = true;

    const queryParams = {
      cui: this.cui,
      clasificacion: this.clasificacionesSeleccionadas ? this.clasificacionesSeleccionadas.map(x => x.value) : null,
      tipo: this.tipoSeleccionado ? this.tipoSeleccionado : null,
      estado: this.estadosSelecionados ? this.estadosSelecionados.map(x => x.value) : null,
      tipoEspacio: this.tipoEspacioSeleccionado ? this.tipoEspacioSeleccionado.value : null,
      espacio: this.espaciosSeleccionados ? this.espaciosSeleccionados.map(x => x.value) : null,
      sector: this.sectoresSeleccionados ? this.sectoresSeleccionados.map(x => x.value) : null,
      dep: this.depSeleccionado ? this.depSeleccionado.value : null,
      prov: this.provSeleccionada ? this.provSeleccionada.value : null,
      dis: this.disSeleccionado ? this.disSeleccionado.value : null,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder
    };

    // Guardar en el localStorage
    localStorage.setItem('hitosParams', JSON.stringify(queryParams));

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge'
    }).finally(() => {
      this.updatingParams = false;
    });
  }

  onClearFilters(excepciones: string[]): void {
    // Primero restablecemos todos los filtros excepto los que están en la lista de excepciones
    if (!excepciones.includes('cui')) {
      this.cui = null;
    }
    if (!excepciones.includes('clasificacion')) {
      this.clasificacionesSeleccionadas = [];
    }
    if (!excepciones.includes('tipo')) {
      this.tipoSeleccionado = null;
    }
    if (!excepciones.includes('estado')) {
      this.estadosSelecionados = [];
    }
    if (!excepciones.includes('tipoEspacio')) {
      this.tipoEspacioSeleccionado = null;
    }
    if (!excepciones.includes('espacio')) {
      this.espaciosSeleccionados = [];
    }

    if (this.authService.subTipo() != 'SECTOR') {
      this.sectoresSeleccionados = [];
    }

    if (this.authService.subTipo() != 'REGION') {
      this.depSeleccionado = null;
    }
    if (this.authService.subTipo() != 'PROVINCIA') {
      this.provSeleccionada = null;
    }
    if (this.authService.subTipo() != 'DISTRITO') {
      this.disSeleccionado = null;
    }

    // Restablecer paginación, orden y otros parámetros globales
    this.pageIndex = 1;
    this.pageSize = 10;
    this.sortField = 'acuerdoID';
    this.sortOrder = 'descend';

    // Actualizar los valores en el formulario de búsqueda
    this.searchForm.patchValue({
      cui: this.cui,
      clasificacion: this.clasificacionesSeleccionadas,
      tipo: this.tipoSeleccionado,
      estado: this.estadosSelecionados,
      tipoEspacio: this.tipoEspacioSeleccionado,
      espacio: this.espaciosSeleccionados,
      sector: this.sectoresSeleccionados,
      dep: this.depSeleccionado,
      prov: this.provSeleccionada,
      dis: this.disSeleccionado,
    });


    // Actualizar el contador de filtros activos (filterCounter)
    this.filterCounter.set(
      ((this.cui != undefined && this.cui != null && this.cui != '') ? 1 : 0) +
      (this.clasificacionesSeleccionadas && this.clasificacionesSeleccionadas.length ? this.clasificacionesSeleccionadas.length : 0) +
      (this.tipoSeleccionado ? 1 : 0) +
      (this.estadosSelecionados && this.estadosSelecionados.length ? this.estadosSelecionados.length : 0) +
      (this.tipoEspacioSeleccionado ? 1 : 0) +
      (this.espaciosSeleccionados && this.espaciosSeleccionados.length ? this.espaciosSeleccionados.length : 0) +
      (this.sectoresSeleccionados && this.sectoresSeleccionados.length ? this.sectoresSeleccionados.length : 0) +
      (this.depSeleccionado ? 1 : 0) +
      (this.provSeleccionada ? 1 : 0) +
      (this.disSeleccionado ? 1 : 0)
    );

    // Actualizamos los queryParams para reflejar los cambios en la URL
    this.updateQueryParams();
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    if (!this.updatingParams && !this.cargandoUbigeo) { // Agrega la verificación de cargandoUbigeo
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

        if (!this.disSeleccionado && this.authService.distrito()) {
          const defaultDis = this.authService.distrito();
          if (defaultDis) {
            this.disSeleccionado = defaultDis;
            this.searchForm.patchValue({ dis: this.disSeleccionado });
            this.filterCounter.update(x => x + 1);
          }
        }
      }

      this.traerHitos({
        pageIndex,
        pageSize,
        sortField: this.sortField,
        sortOrder: this.sortOrder
      });

      // Emitir cambios de parámetros
      this.updateParamsSubject.next();
    }
  }

  crearSearForm(): void {
    this.searchForm = this.fb.group({
      cui: [null],
      clasificacion: [null],
      tipo: [null],
      estado: [null],
      tipoEspacio: [null],
      espacio: [null],
      sector: [null],
      dep: [null],
      prov: [null],
      dis: [null],
    });
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

}
