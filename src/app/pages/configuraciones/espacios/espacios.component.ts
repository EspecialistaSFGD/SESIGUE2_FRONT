import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewContainerRef } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
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
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { EspacioComponent } from './espacio/espacio.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { EspaciosService } from '../../../libs/services/espacios/espacios.service';
import { PageHeaderComponent } from '../../../libs/shared/layout/page-header/page-header.component';
import { EstadoComponent } from '../../../libs/shared/components/estado/estado.component';
import { EspacioModel, EspacioResponseModel, TraerEspaciosInterface } from '../../../libs/models/shared/espacio.model';

@Component({
  selector: 'app-espacios',
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
  templateUrl: './espacios.component.html',
  styles: ``,
})
export class EspaciosComponent {
  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  title: string = `Espacios de Articulación`;
  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string | null = 'eventoID';
  sortOrder: string | null = 'descend';
  isDrawervisible: boolean = false;
  eventoId: number = 0;
  estadoActual: number = 1;

  filterCounter = signal<number>(0);

  private updateParamsSubject: Subject<void> = new Subject<void>();
  private updatingParams: boolean = false;
  private clearingFilters: boolean = false;
  private timeout: any;
  espaciosService = inject(EspaciosService);

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private fb = inject(UntypedFormBuilder);
  private modal = inject(NzModalService);

  // private confirmModal = inject(NzModalRef);
  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);

  constructor() {
    this.crearSearchForm();

    // Obtener los valores de los queryParams en la primera carga
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

        // Inicializar el contador con la suma de las selecciones iniciales
        // this.filterCounter.set(
        //   ((this.cui != undefined && this.cui != null && this.cui != '') ? 1 : 0) +
        //   (this.clasificacionesSeleccionadas ? this.clasificacionesSeleccionadas.length : 0) +
        //   (this.tipoSeleccionado ? 1 : 0) +
        //   (this.estadosSelecionados ? this.estadosSelecionados.length : 0) +
        //   (this.espaciosSeleccionados ? this.espaciosSeleccionados.length : 0) +
        //   (this.sectoresSeleccionados ? this.sectoresSeleccionados.length : 0) +
        //   (this.depSeleccionado ? 1 : 0) +
        //   (this.provSeleccionada ? 1 : 0)
        // );
      }
    });
    // Debounce los cambios de parámetros de la URL
    this.updateParamsSubject.pipe(debounceTime(300)).subscribe(() => {
      this.updateQueryParams();
    });
  }

  traerEspacios(
    {
      estado = this.estadoActual,
      pageIndex = this.pageIndex,
      pageSize = this.pageSize,
      sortField = this.sortField,
      sortOrder = this.sortOrder
    }: TraerEspaciosInterface
  ): void {
    this.espaciosService.listarEventos(estado, pageIndex, pageSize, sortField, sortOrder);
  }

  onAddEdit(value: EspacioResponseModel | null): void {
    const title = value ? 'Editar Espacio' : 'Agregar Espacio';
    const labelOk = value ? 'Actualizar' : 'Agregar';

    this.espaciosService.seleccionarEventoById(value?.eventoId);

    const modal = this.modal.create<EspacioComponent>({
      nzTitle: title,
      nzContent: EspacioComponent,
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
            return this.espaciosService.agregarEvento(componentInstance!.espacioForm.value).then((res) => {
              this.modal.closeAll();
            });
          },
          loading: this.espaciosService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.espacioForm.valid,
        },
      ],
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.espacioForm.reset();
    });
  }

  onActualizarEstado(evento: EspacioResponseModel): void {
    const title: string = `¿Está seguro de cambiar el estado del espacio?`;
    let content: string = ``;

    switch (evento.descripcionVigente) {
      case 'No Iniciado':
        content = `El estado del espacio cambiará de <strong>No Iniciado</strong> a <strong>Iniciado</strong>.`;
        break;
      case 'Iniciado':
        content = `El estado del espacio cambiará de <strong>Iniciado</strong> a <strong>Seguimiento</strong>.`;
        break;
      case 'Seguimiento':
        content = `El estado del espacio cambiará de <strong>Seguimiento</strong> a <strong>Finalizado</strong>.`;
        break;
      default:
        console.log('No se puede cambiar el estado');
    }

    content += `<p class="mt-2">Esta acción no se puede deshacer.</p>`;

    this.confirmModal = this.modal.confirm({
      nzTitle: title,
      nzContent: content,
      nzOkText: 'Cambiar estado',
      nzOkType: 'primary',
      nzOkDanger: false,
      nzOnOk: () => {
        switch (evento.descripcionVigente) {
          case 'No Iniciado':
            this.espaciosService.iniciarEvento(evento.eventoId!).then(() => {
              this.modal.closeAll();
            });
            break;
          case 'Iniciado':
            this.espaciosService.iniciarSeguimientoEvento(evento.eventoId!).then(() => {
              this.modal.closeAll();
            });
            break;
          case 'Seguimiento':
            this.espaciosService.finalizarSeguimientoEvento(evento.eventoId!).then(() => {
              this.modal.closeAll();
            });
            break;
          default:
            this.modal.closeAll();
            console.log('No se puede cambiar el estado');

          // case 'Seguimiento':
          //   this.espaciosService.seguimientoEvento(id).then(() => {
          //     this.modal.closeAll();
          //   });
          //   break;
          // case 'Finalizado':
          //   this.espaciosService.finalizarEvento(id).then(() => {
          //     this.modal.closeAll();
          //   });
          //   break;
        }
      },
    });
  }

  onDelete(id: number): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: '¿Está seguro de eliminar el espacio?',
      nzContent: 'Esta acción no se puede deshacer',
      nzOkText: 'Eliminar',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.espaciosService.eliminarEvento(id).then(() => {
          this.modal.closeAll();
        });
      },
    });
  }

  onOpenDrawer(): void {
    this.isDrawervisible = true;
  }

  onCloseDrawer(): void {
    this.isDrawervisible = false;
  }

  crearSearchForm(): void {
    this.searchForm = this.fb.group({
      tipo: [null],
    });
  }

  updateQueryParams(): void {
    this.updatingParams = true;

    const queryParams = {
      eventoId: this.eventoId,
      estado: this.estadoActual,
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

      this.traerEspacios({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        sortField: this.sortField,
        sortOrder: this.sortOrder
      });

      this.updateQueryParams();
    }
  }
}
