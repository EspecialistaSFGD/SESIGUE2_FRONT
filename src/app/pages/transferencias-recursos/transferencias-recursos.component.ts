import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { ButtonsActions, FileResponse, Pagination, TransferenciaRecursoData, TransferenciaRecursoResponse } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { IndiceTransferenciaRecursoComponent } from './indice-transferencia-recurso/indice-transferencia-recurso.component';
import { TransferenciaRecursoService } from '@core/services';
import { UtilesService } from '@libs/shared/services/utiles.service';
import saveAs from 'file-saver';
import { PipesModule } from '@core/pipes/pipes.module';
import { BotonDescargarComponent } from '@shared/boton/boton-descargar/boton-descargar.component';
import { deleteKeysToObject, getDateFormat, obtenerPermisosBotones, setParamsToObject } from '@core/helpers';
import { MessageService } from 'primeng/api';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { FiltroTransferenciaRecursoComponent } from './filtro-transferencia-recurso/filtro-transferencia-recurso.component';
import { AuthService } from '@libs/services/auth/auth.service';

@Component({
  selector: 'app-transferencias-recursos',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, PrimeNgModule, NgZorroModule, PipesModule, BotonDescargarComponent, FiltroTransferenciaRecursoComponent],
  providers: [MessageService],
  templateUrl: './transferencias-recursos.component.html',
  styles: ``
})
export default class TransferenciasRecursosComponent {

  loading: boolean = false
  loadingUpload: boolean = false
  formatoIndice: string = '/assets/uploads/transferencias_recursos/formato_indice.xlsx'
  modalRef: NzModalRef | null = null
  openFilters: boolean = false

  recursosActions: ButtonsActions = {}

  transferenciasRecursos = signal<TransferenciaRecursoResponse[]>([])
  
  pagination: Pagination = {
    columnSort: 'grupoID',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  private transferenciaRecurso = inject(TransferenciaRecursoService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private modal = inject(NzModalService) 
  private utilesService = inject(UtilesService)
  private messageService = inject(MessageService)
  private authStore = inject(AuthService)

  ngOnInit(): void {
    // this.obtenerRecursos()
    this.getParams()
    this.getPermissions()
  }

  getParams() {
    this.route.queryParams.subscribe(params => {
      this.loading = true
      if (Object.keys(params).length > 0) {        
        let campo = params['campo'] ?? 'grupoID'

        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'
        
        setParamsToObject(params, this.pagination, 'codigo')
        setParamsToObject(params, this.pagination, 'nombre')
        // setParamsToObject(params, this.pagination, 'grupoID')
      }
      setTimeout(() => this.obtenerRecursos(), 500);
    })
  }

  getPermissions() {
      const navigation = this.authStore.navigationAuth()!
      const transferenciaRecursos = navigation.find(nav => nav.descripcionItem == 'Transferencia Recursos')
      this.recursosActions = obtenerPermisosBotones(transferenciaRecursos!.botones!)   
    }

  obtenerRecursos(){
    this.transferenciaRecurso.ListarTransferenciasRecurso({...this.pagination })
      .subscribe( resp => {
        this.loading = false
        this.transferenciasRecursos.set(resp.data)
        this.pagination.total = resp.info?.total
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const qtySorts = params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)
    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filtrosSaved = localStorage.getItem('filtrosTransferenciasRecursos');
    let filtros:any = {}
    if(filtrosSaved){
      filtros = JSON.parse(filtrosSaved)
      filtros.save = false      
      localStorage.setItem('filtrosTransferenciasRecursos', JSON.stringify(filtros))
    }
    this.paramsNavigate({...filtros, pagina: params.pageIndex, cantidad: params.pageSize, campo, ordenar, save: null })
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

  generarMov(transferenciaId: string){
    this.transferenciaRecurso.GenerarMov(transferenciaId,this.pagination)
      .subscribe( resp => {
        if(resp.data){
          this.generarDescarga(resp.data);
        }
      })
  }

  generarDescarga(archivo: FileResponse): void {    
    const arrayBuffer = this.utilesService.base64ToArrayBuffer(archivo.archivo);
    const blob = new Blob([arrayBuffer], { type: archivo.contentType });
    saveAs(blob, archivo.nombreArchivo);
  }

  agregarTransferenciaIndice(recurso:TransferenciaRecursoResponse, indice: boolean = true){
    let success = true
    const title = indice ? `NUEVO INDICE` : `NUEVA PROYECCIÓN`
    this.modalRef = this.modal.create<IndiceTransferenciaRecursoComponent>({
      nzTitle: `${title} DE ${recurso.recurso.toUpperCase()}`,
      nzMaskClosable: false,
      nzWidth: '40%',
      nzContent: IndiceTransferenciaRecursoComponent,
      nzData: { indice, success, recursosIndices: [] },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Guardar',
          type: 'primary',
          loading: () => this.loadingUpload,
          onClick: (componentResponse) => {
            const formIndice = componentResponse!.formIndice
           
            if (formIndice.invalid) {
              const invalidFields = Object.keys(formIndice.controls).filter(field => formIndice.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formIndice.markAllAsTouched();
            }

            const usuarioId = localStorage.getItem('codigoUsuario')
            const recursoId = recurso.recursoId
            const fecha = getDateFormat(formIndice.get('fecha')?.value, 'month')

            const transferenciaRecursoIndice: TransferenciaRecursoData = { ...formIndice.value, fecha, recursoId, usuarioId  }
            this.subirRecurso(transferenciaRecursoIndice, indice)
            
          }
        }
      ]
    })
  }

  subirRecurso(transferenciaRecursoIndice: TransferenciaRecursoData, indice:boolean){
    this.loadingUpload = true
    this.transferenciaRecurso.subirRecurso(transferenciaRecursoIndice, indice)
      .subscribe( resp => {
        if(resp.success){
          this.messageService.add({ severity: 'success', summary: 'Carga exitosa', detail: resp.message });       
          this.obtenerRecursos()
          this.modal.closeAll();
        } else {
          const recursosIndices = resp.data.filter(item => item.estado === false);
          this.modalRef!.getContentComponent()!.data = { indice, success: false, recursosIndices }
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });       
        }
        this.loadingUpload = false
      })
  }

  generateFilters(pagination: Pagination){
    const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total']
    const params = deleteKeysToObject(pagination, paramsInvalid)
    this.paramsNavigate(params)
  }
}