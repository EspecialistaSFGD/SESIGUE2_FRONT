import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { EventoResponse, Pagination, TipoEventoResponse } from '@core/interfaces';
import { EventosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { EstadoTagComponent } from '@shared/estado-tag/estado-tag.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FiltroEventosComponent } from './filtro-eventos/filtro-eventos.component';
import { deleteKeysToObject, getDateFormat, setParamsToObject } from '@core/helpers';
import { distinctUntilChanged, filter } from 'rxjs';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { FormularioEventoComponent } from './formulario-evento/formulario-evento.component';
import { MessageService } from 'primeng/api';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { UtilesService } from '@libs/shared/services/utiles.service';
import saveAs from 'file-saver';
import { BotonComponent } from '@shared/boton/boton/boton.component';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, RouterModule, NgZorroModule, PrimeNgModule, EstadoTagComponent, FiltroEventosComponent, BotonComponent],
  providers: [MessageService],
  templateUrl: './eventos.component.html',
  styles: ``
})
export default class EventosComponent {
  loading: boolean = false
  openFilters: boolean = false
  loadingExport: boolean = false

  pagination: Pagination = {
    columnSort: 'eventoId',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  estadosFilters:string = ''
  tipoEspacioIdFilters:string = ''

  eventos = signal<EventoResponse[]>([])
  tipoEventos = signal<TipoEventoResponse[]>([])
  confirmModal?: NzModalRef;

  private eventoService = inject(EventosService)
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private modal = inject(NzModalService);
  private messageService = inject(MessageService)
  private utilesService = inject(UtilesService);

  ngOnInit(): void {
    this.getParams()
  }

  getParams() {
    this.route.queryParams
      .pipe(
        filter(params => Object.keys(params).length > 0),
        distinctUntilChanged((prev,curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe( params => {
        this.loading = true
        // const estado = params['estado'] ?? ''
        // const tipoEspacioId = params['tipoEspacioId'] ?? ''
        this.estadosFilters = params['estado'] ?? null
        this.tipoEspacioIdFilters = params['tipoEspacioId'] ?? null
        let campo = params['campo'] ?? 'eventoId'
        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'
        
        setParamsToObject(params, this.pagination, 'nombre')
        setParamsToObject(params, this.pagination, 'estado')          
        setParamsToObject(params, this.pagination, 'tipoEspacioId')

        this.obtenerEventoService()
      })
  }

  obtenerEventoService(){
    this.loading = true
    const tipoEventosId = this.tipoEspacioIdFilters ? [this.tipoEspacioIdFilters] : []
    const estados = this.estadosFilters ? [this.estadosFilters] : []
    this.eventoService.ListarEventos({...this.pagination, tipoEventosId, estados})
      .subscribe( resp => {
        this.eventos.set(resp.data)
        this.pagination.total = resp.info?.total
        this.loading = false
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)

    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filterStorageExist = localStorage.getItem('filtrosEventos');
    let filtros:any = {}
    if(filterStorageExist){      
      filtros = JSON.parse(filterStorageExist)
      filtros.save = false      
      localStorage.setItem('filtrosEventos', JSON.stringify(filtros))
    }    
    this.paramsNavigate({...filtros, pagina: params.pageIndex, cantidad: params.pageSize, campo, ordenar, save: null })    
  }

  generateFilters(pagination: Pagination){
    const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total']
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

  reporteEventos(){
    this.loadingExport = true;

    const tipoEspacio = this.tipoEspacioIdFilters ? [this.tipoEspacioIdFilters] : []
    const estado = this.estadosFilters ? [this.estadosFilters] : []  
    this.eventoService.reporteEventos(this.pagination,estado,tipoEspacio)
      .subscribe(resp => {
        this.loadingExport = false
        if(resp.success){
          const reporte = resp.data;
          this.generarExcel(reporte.archivo, reporte.nombreArchivo);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }

  generarExcel(archivo: any, nombreArchivo: string): void {
    const arrayBuffer = this.utilesService.base64ToArrayBuffer(archivo);
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, nombreArchivo);
  }

  crearEvento(){
    const evento:  EventoResponse = {} as EventoResponse
    this.eventoFormModal(evento)
  }

  eventoFormModal(evento: EventoResponse, create: boolean = true){    
    const action = `${create ? 'Crear' : 'Actualizar' } Espacio`
    this.modal.create<FormularioEventoComponent>({
      nzTitle: `${action.toUpperCase()}`,
      nzWidth: '50%',
      nzMaskClosable: false,
      nzContent: FormularioEventoComponent,
      nzData: { create, evento },
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
            const formEvento = componentResponse!.formEvento
           
            if (formEvento.invalid) {
              const invalidFields = Object.keys(formEvento.controls).filter(field => formEvento.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formEvento.markAllAsTouched();
            }

            const fechaEvento = getDateFormat(formEvento.get('fechaEvento')?.value, 'month')
            const fechaFinEvento = getDateFormat(formEvento.get('fechaFinEvento')?.value, 'month')

            const body:EventoResponse = { ...formEvento.value, fechaEvento, fechaFinEvento }
            if(!create){
              body.eventoId = evento.eventoId
            }
            create ? this.crearEventoService(body) : this.actualizarEventoService(body)
          }
        }
      ]
    })
  }

  crearEventoService(evento: EventoResponse){
    this.eventoService.registrarEvento(evento)
      .subscribe( resp => {        
        if(resp.success){
          this.messageService.add({ severity: 'success', summary: 'Evento registrado', detail: resp.message });
          this.obtenerEventoService()
          this.modal.closeAll();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }
  
  actualizarEventoService(evento: EventoResponse){
    this.eventoService.actualizarEvento(evento)
      .subscribe( resp => {        
        if(resp.success){
          this.messageService.add({ severity: 'success', summary: 'Evento Actualizado', detail: resp.message });
          this.obtenerEventoService()
          this.modal.closeAll();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }

  eliminarEvento(evento: EventoResponse){
    this.confirmModal = this.modal.confirm({
      nzTitle: `¿Está seguro de eliminar en evento? ${evento.abreviatura}`,
      nzContent: 'Esta acción no se puede deshacer.',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => this.eliminarEventoService(evento.eventoId!),
      nzCancelText: 'Cancelar',
    });
  }
  
  eliminarEventoService(eventoId: string){
    this.eventoService.eliminarEvento(eventoId)
      .subscribe(resp => {
        if (resp.success == true) {
          this.obtenerEventoService()
          this.messageService.add({ severity: 'success', summary: 'Evento Eliminado', detail: resp.message });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }
}
