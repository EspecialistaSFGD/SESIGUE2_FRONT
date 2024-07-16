import { Component, OnInit, Signal, ViewContainerRef, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { AcuerdosService } from '../../../libs/services/pedidos/acuerdos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HitosService } from '../../../libs/services/pedidos/hitos.service';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { TraerAvancesInterface, TraerHitosInterface } from '../../../libs/interfaces/pedido/pedido.interface';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { AvancesService } from '../../../libs/services/pedidos/avances.service';
import { AvanceHitoModel, HitoAcuerdoModel } from '../../../libs/models/pedido';
import { Subject, debounceTime } from 'rxjs';
import { HitoComponent } from '../../hitos/hito/hito.component';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { AvanceComponent } from '../../avances/avance/avance.component';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { PageHeaderComponent } from '../../../libs/shared/layout/page-header/page-header.component';
import { ComentarioComponent } from '../../../libs/shared/components/comentario/comentario.component';
import { AuthService } from '../../../libs/services/auth/auth.service';
import { AccionModel } from '../../../libs/models/auth/accion.model';
import { PermisoModel } from '../../../libs/models/auth/permiso.model';

@Component({
  selector: 'app-acuerdo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzGridModule,
    NzInputModule,
    PageHeaderComponent,
    NzDescriptionsModule,
    NzTableModule,
    NzButtonModule,
    NzSpaceModule,
    NzToolTipModule,
    NzDropDownModule,
    NzIconModule,
    NzRadioModule,
    HitoComponent,
    NzModalModule,
    NzBadgeModule
  ],
  providers: [

  ],
  templateUrl: './acuerdo.component.html',
  styleUrl: './acuerdo.component.less'
})
export class AcuerdoComponent implements OnInit {
  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';

  // title: string = `Gestión de hitos para el ...`;
  id: string | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string = 'hitoId';
  sortOrder: string = 'ascend';

  pageIndexAvance: number = 1;
  pageSizeAvance: number = 10;
  sortFieldAvance: string = 'avanceId';
  sortOrderAvance: string = 'ascend';
  hitoSeleccionadoId: number | null = null; // ID del hito seleccionado
  // hitoSeleccionado: HitoAcuerdoModel | null = null;
  queryParamsChangeEventCnt = 0;
  evidenciaBaseUrl = 'https://sesigue.com/SESIGUE/SD/evidencia/';


  private updateParamsSubject: Subject<void> = new Subject<void>();
  private updatingParams: boolean = false;

  public acuerdosService = inject(AcuerdosService);
  public hitosService = inject(HitosService);
  public avancesService = inject(AvancesService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private modal = inject(NzModalService);

  // private confirmModal = inject(NzModalRef);
  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);
  permiso: PermisoModel | null | undefined = null;
  storedPermiso = localStorage.getItem('permisos');

  constructor(

  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!this.id) {
      this.router.navigate(['/acuerdos']); // Redirige a una página de error
    } else {
      this.acuerdosService.listarAcuerdo(Number(this.id));

      try {
        this.permiso = this.storedPermiso ? JSON.parse(this.storedPermiso) : {};
      } catch (e) {
        console.error('Error parsing JSON from localStorage', e);
        this.permiso = null;
      }

      console.log('Permiso:', this.permiso);
    }

    this.activatedRoute.queryParams.subscribe((params) => {
      if (!this.updatingParams) {
        if (!this.updatingParams) {
          if (params['hito'] != null) {
            this.hitoSeleccionadoId = Number(params['hito']);
          }
        }
      }
    });

    this.updateParamsSubject.pipe(debounceTime(300)).subscribe(() => {
      this.updateQueryParams();
    });
  }

  ngOnInit(): void {

  }

  traerHitos({
    acuerdoID = Number(this.id) || null,
    hitoID = Number(this.hitoSeleccionadoId) || null,
    pageIndex = this.pageIndex,
    pageSize = this.pageSize,
    sortField = this.sortField,
    sortOrder = this.sortOrder
  }: TraerHitosInterface): void {
    this.hitosService.listarHitos(acuerdoID, hitoID, pageIndex, pageSize, sortField, sortOrder);
  }

  traerAvances({
    hitoId = null,
    pageIndex = this.pageIndexAvance,
    pageSize = this.pageSizeAvance,
    sortField = this.sortFieldAvance,
    sortOrder = this.sortOrderAvance
  }: TraerAvancesInterface): void {
    this.avancesService.listarAvances(hitoId, pageIndex, pageSize, sortField, sortOrder);
  }

  onHitoSelected(hito: HitoAcuerdoModel): void {
    if (hito == null) {
      this.hitosService.seleccionarHitoById(null);

      return;
    }

    this.hitoSeleccionadoId = hito.hitoId!;
    // this.hitoSeleccionado = hito;
    this.hitosService.seleccionarHitoById(hito.hitoId);
    this.traerAvances({ hitoId: Number(hito.hitoId) });

    this.updateParamsSubject.next();
  }

  onRowClick(event: MouseEvent, hito: HitoAcuerdoModel): void {
    // Evitar la selección si se hace clic en un botón
    const target = event.target as HTMLElement;

    if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'A' || target.closest('a')) {
      return;
    }

    if (this.hitoSeleccionadoId === hito.hitoId) {
      return;
    }

    this.onHitoSelected(hito);
  }

  onHitoSelectedById(hitoId: number): void {
    if (hitoId == null) {
      this.hitosService.seleccionarHitoById(null);

      return;
    }

    this.hitoSeleccionadoId = hitoId!;
    this.hitosService.seleccionarHitoById(hitoId);
    this.traerAvances({ hitoId: Number(hitoId) });

    this.updateParamsSubject.next();
  }

  onHitoDeselected(): void {
    this.hitoSeleccionadoId = null;
    // this.hitoSeleccionado = null;
    this.hitosService.seleccionarHitoById(null);
    this.updateParamsSubject.next();
  }

  onHitoAddEdit(hito: HitoAcuerdoModel | null): void {
    const title = hito ? `Modificando hito "${hito.hito}"` : 'Registrando nuevo hito';
    const labelOk = hito ? `Actualizar` : 'Registrar';
    this.hitosService.seleccionarHitoById(hito?.hitoId);

    const modal = this.modal.create<HitoComponent>({
      nzTitle: title,
      nzContent: HitoComponent,
      nzViewContainerRef: this.viewContainerRef,
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
          label: labelOk,
          onClick: componentInstance => {
            return this.hitosService.agregarEditarHito(componentInstance!.hitoForm.value).then((res) => {
              console.log(res);

              this.onHitoSelectedById(res.data);

              this.modal.closeAll();
            });
          },
          loading: this.hitosService.isEditing(), // Vincular estado de carga
          disabled: componentInstance => !componentInstance || !componentInstance.hitoForm.valid
        }]
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.hitoForm.reset();
    });
  }

  onHitoAddComentario(hito: HitoAcuerdoModel): void {
    this.hitosService.seleccionarHitoById(hito?.hitoId);

    const modal = this.modal.create<ComentarioComponent>({
      nzTitle: `Comentario para el hito "${hito.hito}"`,
      nzContent: ComentarioComponent,
      nzViewContainerRef: this.viewContainerRef,
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
            return this.hitosService.agregarComentarioHito(componentInstance!.comentarioForm.value).then((res) => {
              console.log(res);
              this.modal.closeAll();
            });
          },
          loading: this.hitosService.isEditing(),
          disabled: componentInstance => !componentInstance || !componentInstance.comentarioForm.valid
        }]
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.comentarioForm.reset();
    });
  }

  onHitoAddComentarioSD(hito: HitoAcuerdoModel): void {
    this.hitosService.seleccionarHitoById(hito?.hitoId);

    const modal = this.modal.create<ComentarioComponent>({
      nzTitle: `Comentario de Secretaría Digital para el hito "${hito.hito}"`,
      nzContent: ComentarioComponent,
      nzViewContainerRef: this.viewContainerRef,
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
            return this.hitosService.agregarComentarioSDHito(componentInstance!.comentarioForm.value).then((res) => {
              console.log(res);
              this.modal.closeAll();
            });
          },
          loading: this.hitosService.isEditing(),
          disabled: componentInstance => !componentInstance || !componentInstance.comentarioForm.valid
        }]
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.comentarioForm.reset();
    });
  }

  onReactivarEstadoHito(hito: HitoAcuerdoModel): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: `¿Deseas reactivar el hito: "${hito.hito}"?`,
      nzContent: 'El hito volverá a estar EN PROCESO.',
      nzOnOk: () => this.hitosService.reactivarEstadoHito(hito)
    });
  }

  onValidarHito(hito: HitoAcuerdoModel): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: `¿Deseas validar el hito: "${hito.hito}"?`,
      nzContent: 'El hito pasará a estar VALIDADO.',
      nzIconType: 'check-circle',
      nzOnOk: () => this.hitosService.validarHito(hito)
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

  onEliinarHito(hito: HitoAcuerdoModel): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: `¿Deseas desestimar el hito: "${hito.hito}"?`,
      nzContent: 'El hito será desestimado de forma permanente.',
      nzIconType: 'exclamation-circle',
      nzOkDanger: true,
      nzOnOk: () => this.hitosService.eliminarHito(hito)
    });
  }

  onAvanceAddEdit(avance: AvanceHitoModel | null): void {
    const title = avance ? `Modificando avance "${avance.avance}"` : 'Nuevo avance';
    this.avancesService.seleccionarAvanceById(avance?.avanceId);
    const labelOk = avance ? `Actualizar` : 'Registrar';
    // console.log(this.avancesService.avanceSeleccionado());

    const avanceModal = this.modal.create<AvanceComponent>({
      nzTitle: title,
      nzContent: AvanceComponent,
      nzViewContainerRef: this.viewContainerRef,
      // nzData: hito,
      nzMaskClosable: false,
      nzClosable: false,
      nzKeyboard: false,
      // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
      nzFooter: [
        {
          label: 'Cancelar',
          onClick: () => this.modal.closeAll()
        },
        {
          type: 'primary',
          label: labelOk,
          onClick: componentInstance => {
            return this.avancesService.agregarEditarAvance(componentInstance!.avanceForm.value).then((res) => {
              console.log(res);
              this.traerAvances({ hitoId: Number(this.hitoSeleccionadoId) });
              this.modal.closeAll();
            });
          },
          loading: this.avancesService.isEditing(),
          disabled: componentInstance => !componentInstance || !componentInstance.avanceForm.valid
        }]
    });
    const instance = avanceModal.getContentComponent();
    //avanceModal.afterOpen.subscribe(() => console.log(instance.hitoForm.value));
    // Return a result when closed
    avanceModal.afterClose.subscribe(result => {
      instance.avanceForm.reset();
    });
  }


  updateQueryParams() {
    this.updatingParams = true;

    const queryParams = {
      hito: this.hitoSeleccionadoId,
    };

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge'
    }).finally(() => {
      this.updatingParams = false;
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort } = params;
    const currentSort = sort.find(item => item.value !== null);
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sortField = (currentSort && currentSort.key) || this.sortField;
    this.sortOrder = (currentSort && currentSort.value) || this.sortOrder;

    this.traerHitos({
      acuerdoID: Number(this.id),
      hitoID: Number(this.hitoSeleccionadoId),
      pageIndex,
      pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    });
  }

  onQueryParamsChangeAvances(params: NzTableQueryParams): void {
    // if (++this.queryParamsChangeEventCnt == 1) return;

    if (!this.updatingParams) {

      const { pageSize, pageIndex, sort } = params;
      const currentSort = sort.find(item => item.value !== null);
      this.pageIndexAvance = pageIndex;
      this.pageSizeAvance = pageSize;
      this.sortFieldAvance = (currentSort && currentSort.key) || this.sortFieldAvance;
      this.sortOrderAvance = (currentSort && currentSort.value) || this.sortOrderAvance;
      this.traerAvances({
        hitoId: this.hitoSeleccionadoId,
        pageIndex,
        pageSize,
        sortField: this.sortFieldAvance,
        sortOrder: this.sortOrderAvance
      });

      // Emitir cambios de parámetros
      this.updateParamsSubject.next();
    }

  }
}


