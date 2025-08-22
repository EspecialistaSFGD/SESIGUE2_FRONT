import { AfterViewInit, Component, OnDestroy, OnInit, Signal, ViewContainerRef, inject } from '@angular/core';
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
import { AcuerdoPedidoModel, AvanceHitoModel, HitoAcuerdoModel } from '../../../libs/models/pedido';
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
import { PermisoModel } from '../../../libs/models/auth/permiso.model';
import { UtilesService } from '../../../libs/shared/services/utiles.service';
import { saveAs } from 'file-saver';
import { EstadoComponent } from '../../../libs/shared/components/estado/estado.component';
import { ComentarioModel } from '../../../libs/models/pedido/comentario.model';
import { AuthService } from '../../../libs/services/auth/auth.service';
import { DueToPipe } from '../../../libs/shared/pipes/due-to.pipe';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
// import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { DesestimacionComponent } from '../../../libs/shared/components/desestimacion/desestimacion.component';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { AprobarDesestimacionComponent } from './aprobar-desestimacion/aprobar-desestimacion.component';
import { AcuerdoDesestimacionResponse, ButtonsActions, HitoResponse } from '@core/interfaces';
import { HitosService as HitosCoreService } from '@core/services';
import { AcuerdoNoCumplidoComponent } from './acuerdo-no-cumplido/acuerdo-no-cumplido.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { getDateFormat, obtenerPermisosBotones } from '@core/helpers';

const subTipo = localStorage.getItem('subTipo')?.toUpperCase() || null;

@Component({
  selector: 'app-acuerdo-detalle',
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
    NzBadgeModule,
    NzAlertModule,
    EstadoComponent,
    NzTagModule,
    NzAvatarModule,
    NzPageHeaderModule,
    DueToPipe,
  ],
  providers: [

  ],
  templateUrl: './acuerdo-detalle.component.html',
  styles: ``
})
export class AcuerdoDetalleComponent implements OnInit, AfterViewInit {
  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';

  hitoActions: ButtonsActions = {}

  // title: string = `Gestión de hitos para el ...`;
  id: string | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string = 'hitoId';
  sortOrder: string = 'ascend';

  pageIndexAvance: number = 1;
  pageSizeAvance: number = 10;
  sortFieldAvance: string = 'avanceId';
  sortOrderAvance: string = 'descend';
  hitoSeleccionadoId: number | null = null; // ID del hito seleccionado
  // hitoSeleccionado: HitoAcuerdoModel | null = null;
  queryParamsChangeEventCnt = 0;
  evidenciaBaseUrl = 'https://sesigue.com/SESIGUE/SD/evidencia/';

  authPermission: ButtonsActions = {
    approve: false
  }

  private updateParamsSubject: Subject<void> = new Subject<void>();
  private updatingParams: boolean = false;

  public acuerdosService = inject(AcuerdosService);
  public hitosService = inject(HitosService);
  public authService = inject(AuthService);
  public avancesService = inject(AvancesService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private modal = inject(NzModalService);
  private utilesService = inject(UtilesService);
  private hitoService = inject(HitosCoreService);

  // private confirmModal = inject(NzModalRef);
  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);
  // permiso: PermisoModel | null | undefined = null;
  // storedPermiso = localStorage.getItem('permisos');

  constructor(

  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!this.id) {
      this.router.navigate(['/acuerdos']); // Redirige a una página de error
    } else {
      this.acuerdosService.listarAcuerdo(Number(this.id));

      try {
        // this.permiso = this.storedPermiso ? JSON.parse(this.storedPermiso) : {};
      } catch (e) {
        console.error('Error parsing JSON from localStorage', e);
        // this.permiso = null;
      }

      // console.log('Permiso:', this.permiso);
    }

    this.activatedRoute.queryParams.subscribe((params) => {
      if (!this.updatingParams) {
        if (!this.updatingParams) {
          if (params['hito'] != null) {
            this.hitoSeleccionadoId = Number(params['hito']);

            // this.hitosService.seleccionarHitoById(this.hitoSeleccionadoId);
          }
        }
      }
    });

    this.updateParamsSubject.pipe(debounceTime(300)).subscribe(() => {
      this.updateQueryParams();
    });
  }
  ngAfterViewInit(): void {
    // setTimeout(() => {

    //   console.log(this.hitosService.hitoSeleccionado());
    // }, 500);

  }

  ngOnInit(): void {
    this.getPermissions()
  }

  onBack(url: string | null): void {
    if (url) {
      this.router.navigateByUrl(url);
    } else {
      window.history.back();
    }
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

  getPermissions() {
    const navigation = this.authService.navigationAuth()!;
    const acuerdos = navigation.find(nav => nav.descripcionItem == 'Acuerdos')
    acuerdos?.botones?.map(btn => {      
      this.authPermission.approve = btn.descripcionBoton === 'Aprobar' ? true : this.authPermission.approve
    })

    
    const hitosNav = navigation.find(nav => nav.descripcionItem == 'Hitos')
    if(hitosNav && hitosNav!.botones){
      this.hitoActions = obtenerPermisosBotones(hitosNav!.botones!)
    }    
  }

  onHitoSelected(hito: HitoAcuerdoModel): void {
    if (hito == null) {
      this.hitosService.seleccionarHitoById(null);

      return;
    }

    this.hitoSeleccionadoId = hito.hitoId!;
    // this.hitoSeleccionado = hito;
    this.hitosService.seleccionarHitoById(hito.hitoId);

    if (this.hitosService.hitoSeleccionado().estadoValidado == 'VALIDADO') {
      this.traerAvances({ hitoId: Number(hito.hitoId) });
    }


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

  onDownload(avanceId: number): void {
    if (avanceId == null) return;

    this.avancesService.descargarEvidenciaAvance(avanceId).then((res) => {

      if (res.success == true) {
        var binary_string = this.utilesService.base64ToArrayBuffer(res.data[0].binario);
        var blob = new Blob([binary_string], { type: `application/${res.data[0].tipo}` });

        saveAs(blob, res.data[0].nombre);
      }
    });
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
    // this.acuerdosService.seleccionarAcuerdoById(null);
    this.hitosService.seleccionarHitoById(null);
    this.updateParamsSubject.next();
  }

  onHitoAddEdit(hito: HitoAcuerdoModel | null): void {
    this.onHitoDeselected();

    const title = hito ? `Modificando hito` : 'Registrando nuevo hito';
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

              // this.onHitoSelectedById(res.data);
              this.acuerdosService.listarAcuerdo(Number(this.id));

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

    const modal = this.modal.create<ComentarioComponent, ComentarioModel>({
      nzTitle: `Comentario de Secretaría Digital`,
      nzContent: ComentarioComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        id: hito.hitoId || null,
        tipoComentario: 0,
        tipo: 'HITO',
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

  validateEntidadByHito() :boolean{
    const entidadAcuerdo = this.hitosService.hitoSeleccionado()?.entidadId
    const authEntidad = localStorage.getItem('entidad')
    return entidadAcuerdo == authEntidad
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
      case 'REGION':
      case 'PROVINCIAL':
      case 'DISTRITAL':
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
            return this.avancesService.agregarComentario(componentInstance!.comentarioForm.value).then((res) => {
              console.log(res);
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

  onReactivarEstadoHito(hito: HitoAcuerdoModel): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: `¿Deseas reactivar el hito: "${hito.hito}"?`,
      nzContent: 'El hito volverá a estar EN PROCESO.',
      nzOnOk: () => this.hitosService.reactivarEstadoHito(hito)
    });
  }

  onValidarHito(hito: HitoAcuerdoModel): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: `¿Deseas validar el hito?`,
      nzContent: 'El hito pasará a estar VALIDADO.',
      nzIconType: 'check-circle',
      nzOnOk: () => this.hitosService.validarHito(hito)
    });
  }

  obtenerHitoResponse(hito: HitoAcuerdoModel): HitoResponse {
    const plazo = getDateFormat(hito.plazoFecha!, 'month')
    const entidadId =localStorage.getItem('codigoUsuario')
    const hitoResponse:HitoResponse = {
      hitoId: hito.hitoId!,
      acuerdoId: hito.acuerdoID!,
      hito: hito.hito!,
      validado: hito.validado! == 1,
      responsableId: hito.responsableID!,
      entidadId: hito.entidadId!,
      plazo,
      accesoId: Number(entidadId),
      estado: hito.estado!,
      nomEstado: hito.nomEstado!,
    }
    return hitoResponse
  }

  validarHito(hito: HitoAcuerdoModel, validado:boolean){    
    const hitoResponse = {...this.obtenerHitoResponse(hito), validado}
    this.confirmModal = this.modal.confirm({
      nzTitle: `¿Deseas quitar la valicación del hito?`,
      nzContent: 'Se quitará la validación del hito',
      nzIconType: 'check-circle',
      nzOnOk: () => this.actualizarHito(hitoResponse)
    });    
  }

  actualizarHito(hito: HitoResponse){
    this.hitoService.actualizarHito(hito)
      .subscribe( resp => {
        if(resp.success){
          this.hitosService.listarHitos(hito.acuerdoId, null, 1, 10, 'hitoId', 'ascend');
        }
      })
    
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
      nzTitle: `¿Deseas eliminar el hito?`,
      nzContent: 'El hito será eliminado de forma permanente.',
      nzIconType: 'exclamation-circle',
      nzOkDanger: true,
      nzOnOk: () => this.hitosService.eliminarHito(hito).then(() => {
        this.acuerdosService.listarAcuerdo(Number(this.id));
        this.traerHitos({});
      })
    });
  }

  onEliinarAvance(avance: AvanceHitoModel): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: `¿Deseas eliminar el avance?`,
      nzContent: 'El avance será eliminado de forma permanente.',
      nzIconType: 'exclamation-circle',
      nzOkDanger: true,
      nzOnOk: () => this.avancesService.eliminarAvance(avance).then(() => {
        this.acuerdosService.listarAcuerdo(Number(this.id));
        this.traerHitos({});
        this.traerAvances({ hitoId: Number(this.hitoSeleccionadoId) });
        this.modal.closeAll();
      })
    });
  }

  onAvanceAddEdit(avance: AvanceHitoModel | null): void {
    const title = avance ? `Modificando avance` : 'Nuevo avance';
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
            const formAvance = componentInstance!.avanceForm
            const fecha = getDateFormat(formAvance.get('fecha')?.value)
            formAvance.get('fecha')?.setValue(fecha)
            const avanceForm = componentInstance!.avanceForm.value
            return this.avancesService.agregarEditarAvance(avanceForm).then((res) => {
              this.acuerdosService.listarAcuerdo(Number(this.id));
              this.traerHitos({});
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

  noCumplidoAcuerdo(reasignado: boolean){
    const title = `No Cumplido ${reasignado ? 'Reasignado' : ''}`
    const acuerdo = this.acuerdosService.acuerdoSeleccionado()!
    const modal = this.modal.create<AcuerdoNoCumplidoComponent>({
      nzTitle: title,
      nzContent: AcuerdoNoCumplidoComponent,
      nzData: {
        acuerdo: acuerdo.acuerdoId,
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
            // const form = componentInstance?.formAprobarDesestimacion
            // if (form!.invalid) {
            //   return form!.markAllAsTouched()
            // }
            console.log(componentInstance);
            const usuarioId = this.authService.getCodigoUsuario()
            console.log(usuarioId);
            
          }
        }
      ]
    })
  }

  aprobarDesestimacion(acuerdo: AcuerdoPedidoModel){
    const title = 'Aprobar desestimación'
    const modal = this.modal.create<AprobarDesestimacionComponent>({
      nzTitle: title,
      nzContent: AprobarDesestimacionComponent,
      nzData: {
        acuerdoId: acuerdo.acuerdoId,        
      },
      nzFooter: [
      {
        label: 'Cancelar',
        type: 'default',
        onClick: () => this.modal.closeAll(),
      },
      {
        label: title,
        type: 'primary',
        onClick: (componentInstance) => {
          const form = componentInstance?.formAprobarDesestimacion
          if (form!.invalid) {
            return form!.markAllAsTouched()
          }

          const comentario = form?.get('comentario')!.value!
          const usuarioId = this.authService.getCodigoUsuario()

          const aprobarDesestimacion: AcuerdoDesestimacionResponse = {
            acuerdoId: Number(acuerdo.acuerdoId),
            comentario,
            usuarioId
          }

          console.log(aprobarDesestimacion);
          

          this.acuerdosService.aprobarDesestimacion(aprobarDesestimacion)
            .subscribe( resp => {              
              if(resp == true){
                this.acuerdosService.listarAcuerdo(usuarioId);
                this.modal.closeAll();
              }
            })
          
        },
      }
      ]
    });
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
              this.acuerdosService.listarAcuerdo(Number(this.id!));
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

  disabledValidarHito(validado: number, estadoNombre:string): boolean {
    const estadosValidar = ['PENDIENTE', 'EN PROCESO'];
    return !(validado == 1 && estadosValidar.includes(estadoNombre))
  }
}


