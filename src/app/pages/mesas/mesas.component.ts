import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { deleteKeysToObject, getDateFormat, obtenerPermisosBotones, setParamsToObject } from '@core/helpers';
import { MesaResponse, MesaIntegranteResponse, Pagination, MesaEstadoResponse, ButtonsActions } from '@core/interfaces';
import { IntervencionEspacioService, MesaEstadosService, MesaIntegrantesService } from '@core/services';
import { MesasService } from '@core/services/mesas.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaComponent } from './formulario-mesa/formulario-mesa.component';
import { FormularioMesaEstadoResumenComponent } from './formulario-mesa-estado-resumen/formulario-mesa-estado-resumen.component';
import saveAs from 'file-saver';
import { UtilesService } from '@libs/shared/services/utiles.service';
import { FiltroMesasComponent } from './filtro-mesas/filtro-mesas.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, PageHeaderComponent, SharedModule, FiltroMesasComponent],
  templateUrl: './mesas.component.html',
  styles: ``
})
export default class MesasComponent {
  title: string = `Mesas`;
  
  loadingExport: boolean = false
  loading: boolean = false
  permisosPCM: boolean = false
  perfilAuth: number = 0
  openFilters: boolean = false

  mesasActions: ButtonsActions = {}

  columnSort:string = 'mesaId'
  typeSort:string = 'DESC'
  pagination: Pagination = {
    code: 0,
    columnSort: this.columnSort,
    typeSort: this.typeSort,
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  mesa = signal<MesaResponse>({
    nombre: '',
    abreviatura: '',
    sectorId: '',
    secretariaTecnicaId: '',
    fechaCreacion: '',
    fechaVigencia: '',
    resolucion: '',
    estadoRegistroNombre: '',
    estadoRegistro: '',
    usuarioId: ''
  })

  mesas = signal<MesaResponse[]>([])

  private authStore = inject(AuthService)
  private modal = inject(NzModalService);
  private mesasService = inject(MesasService)
  private intervencionEspaciosServices = inject(IntervencionEspacioService)
  private mesaUbigeosService = inject(MesaIntegrantesService)
  private mesaEstadosService = inject(MesaEstadosService)
  private utilesService = inject(UtilesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute)

  ngOnInit(): void {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.permisosPCM = this.setPermisosPCM()
    this.getParams()
    this.getPermissions()
  }

  getParams() {
    this.route.queryParams.subscribe(params => {
      this.loading = true
      if (Object.keys(params).length > 0) {        
        let campo = params['campo'] ?? 'mesaId'

        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'

        setParamsToObject(params, this.pagination, 'codigo')
        setParamsToObject(params, this.pagination, 'nombre')
        setParamsToObject(params, this.pagination, 'sectorId')
        setParamsToObject(params, this.pagination, 'secretariaTecnicaId')
        setParamsToObject(params, this.pagination, 'sectorEntidadId')
        setParamsToObject(params, this.pagination, 'entidadId')
        setParamsToObject(params, this.pagination, 'ubigeo')
        setParamsToObject(params, this.pagination, 'entidadUbigeoId')        
      }
      setTimeout(() => {
        this.obtenerMesasService()
      }, 500);
    })
  }

  getPermissions() {
    const navigation = this.authStore.navigationAuth()!
    const atenciones = navigation.find(nav => nav.descripcionItem == 'Mesas')
    this.mesasActions = obtenerPermisosBotones(atenciones!.botones!)    
  }

  setPermisosPCM(){
    const profilePCM = [11,12,23]
    return profilePCM.includes(this.perfilAuth)
  }

  obtenerMesasService(){
    this.mesasService.ListarMesas(this.pagination)
      .subscribe( resp => {
        this.loading = false
        this.mesas.set(resp.data)
        this.pagination.total = resp.info?.total
      })
  }

  changeVisibleDrawer(visible: boolean){
    this.openFilters = false
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const qtySorts = params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)
    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filtrosMesas = localStorage.getItem('filtrosMesas');
    let filtros:any = {}
    if(filtrosMesas){
      filtros = JSON.parse(filtrosMesas)
      filtros.save = false      
      localStorage.setItem('filtrosMesas', JSON.stringify(filtros))
    }
    this.paramsNavigate({...filtros, pagina: params.pageIndex, cantidad: params.pageSize, campo, ordenar, save: null })
  }

  saveFilters(save: boolean){
    if(save){
      const pagination: any = { ...this.pagination };
      pagination.pagina = pagination.currentPage
      pagination.cantidad = pagination.pageSize
      pagination.save = true
      if(pagination.columnSort != this.columnSort &&  pagination.typeSort != this.typeSort ){
        pagination.campo = pagination.columnSort
        pagination.ordenar = pagination.typeSort
      }
  
      delete pagination.currentPage
      delete pagination.pageSize
      delete pagination.columnSort
      delete pagination.typeSort
      delete pagination.code
      delete pagination.total
  
      localStorage.setItem('filtrosMesas', JSON.stringify(pagination));
    }
  }

  generateFilters(pagination: Pagination){        
    const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total','departamento','provincia','distrito']
    const params = deleteKeysToObject(pagination, paramsInvalid)
    this.paramsNavigate(params)
  }
  
  paramsNavigate(queryParams: Params){    
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
      }
    );
  }

  reporteMesas(){
    this.loadingExport = true;
    this.mesasService.reporteMesas(this.pagination)
      .subscribe( resp => {
        if(resp.data){
          const data = resp.data;
          this.generarExcel(data.archivo, data.nombreArchivo);
        }
        this.loadingExport = false
      })
  }

  reporteIntervencion(){
    this.loadingExport = true;
    const pagination: Pagination = { origenId: '1' }
    this.intervencionEspaciosServices.reporteIntervencionEspacios({ origenId: '1' })
      .subscribe( resp => {
        if(resp.data){
          const data = resp.data;
          this.generarExcel(data.archivo, data.nombreArchivo);
        }
        this.loadingExport = false
      })
  }
  
  generarExcel(archivo: any, nombreArchivo: string): void {
    const arrayBuffer = this.utilesService.base64ToArrayBuffer(archivo);
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, nombreArchivo);
  }

  crearMesa(){
    this.mesasFormModal(true)
  }

  mesasFormModal(create: boolean): void{
    const action = `${create ? 'Crear' : 'Actualizar' } mesa`
    this.modal.create<FormularioMesaComponent>({
      nzTitle: `${action.toUpperCase()}`,
      nzWidth: '75%',
      nzMaskClosable: false,
      nzContent: FormularioMesaComponent,
      nzData: {
        create,
        mesa: this.mesa
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: action,
          type: 'primary',
          onClick: (componentResponse) => {
            const formMesa = componentResponse!.formMesa
           
            if (formMesa.invalid) {
              const invalidFields = Object.keys(formMesa.controls).filter(field => formMesa.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formMesa.markAllAsTouched();
            }

            const fechaCreacion = getDateFormat(formMesa.get('fechaCreacion')?.value, 'month')
            const fechaVigencia = getDateFormat(formMesa.get('fechaVigencia')?.value, 'month')
            const usuarioId =localStorage.getItem('codigoUsuario')

            const bodyMesa: MesaResponse = {...formMesa.getRawValue() , fechaCreacion, fechaVigencia, usuarioId}

            this.loading = true
            if(create){
              this.registrarMesaService(bodyMesa)
            }
                        
          }
        }
      ]
    })
  }

  registrarMesaService(mesa: MesaResponse) {
    this.mesasService.registarMesa(mesa)
      .subscribe( resp => {
        this.loading = false
        if(resp.success == true){
          const mesaId = resp.data
          const ubigeos: MesaIntegranteResponse[] = mesa.ubigeos!
          const sectores: MesaIntegranteResponse[] = mesa.sectores!          
          const integrantes: MesaIntegranteResponse[] = [ ...ubigeos, ...sectores ];

            for (let integrante of integrantes) {
              integrante.alcaldeAsistenteId = `${integrante.alcaldeAsistenteId}`
              this.mesaUbigeosService.registarMesaIntegrante(mesaId, integrante)
                .subscribe(resp => {
                this.obtenerMesasService();
                this.modal.closeAll();
                });
            }
        }
      })
  }

  crearEstadoResumen(mesa: MesaResponse, esAlerta: boolean){
    const title = esAlerta ? 'ALERTA' : 'ESTADO RESUMEN'
    this.modal.create<FormularioMesaEstadoResumenComponent>({
      nzTitle: `AGREGAR ${title} A MESA ${mesa.codigo}`,
      nzContent: FormularioMesaEstadoResumenComponent,
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Agregar',
          type: 'primary',
          onClick: (componentResponse) => {
            const formEstado = componentResponse!.formEstado
           
            if (formEstado.invalid) {
              const invalidFields = Object.keys(formEstado.controls).filter(field => formEstado.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formEstado.markAllAsTouched();
            }

            const fecha = getDateFormat(formEstado.get('fecha')?.value, 'month')
            const usuarioId =localStorage.getItem('codigoUsuario')
            const tipo = esAlerta ? 1 : 0
            const mesaId = mesa.mesaId
            const bodyEstado: MesaEstadoResponse = { ...formEstado.value, tipo, mesaId, fecha, usuarioId }
            this.registrarMesaEstado(bodyEstado)
          }
        }
      ]
    })
  }

  registrarMesaEstado(mesaEstado: MesaEstadoResponse) {
    this.mesaEstadosService.registarMesaDetalle(mesaEstado)
      .subscribe( resp => {
        if(resp.success == true){
          this.obtenerMesasService()
          this.modal.closeAll()
        }
      })
  }
}
