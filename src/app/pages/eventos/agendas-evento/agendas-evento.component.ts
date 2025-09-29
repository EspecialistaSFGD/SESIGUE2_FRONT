import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoResponse, EventoSectorResponse, IntervencionEspacioResponse, Pagination } from '@core/interfaces';
import { EventoSectoresService, EventosService, IntervencionEspacioService } from '@core/services';
import { EventoDetalleComponent } from '../evento-detalles/evento-detalle/evento-detalle.component';
import { AuthService } from '@libs/services/auth/auth.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { PipesModule } from '@core/pipes/pipes.module';
import { FormularioIntervencionComponent } from '../../intervenciones/formulario-intervencion/formulario-intervencion.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BotonComponent } from '@shared/boton/boton/boton.component';

@Component({
  selector: 'app-agendas-evento',
  standalone: true,
  imports: [CommonModule, PipesModule, EventoDetalleComponent, NgZorroModule, BotonComponent],
  templateUrl: './agendas-evento.component.html',
  styles: ``
})
export default class AgendasEventoComponent {
  evento: EventoResponse = {} as EventoResponse
  
  intervencionesEspacios = signal<IntervencionEspacioResponse[]>([])
  eventosSectores = signal<EventoSectorResponse[]>([])

  eventoId:number = 0
  esSsfgd:boolean = false
  loading = false
  loadingExport = false

  pagination: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    origenId: '0',    
    currentPage: 1
  }
  
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private authStore = inject(AuthService)
  private eventoService = inject(EventosService)
  private intervencionEspaciosServices = inject(IntervencionEspacioService)
  private eventoSectorService = inject(EventoSectoresService)
  private modal = inject(NzModalService);

  ngOnInit(): void {
    this.getPermisosPCM()
    this.verificarEvento()
    this.obtenerEventoSectoresServices()
  }
  
  getPermisosPCM(){
    const perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    const ssfgdPCM = [11,12,23]
    this.esSsfgd = ssfgdPCM.includes(perfilAuth)

    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    return JSON.parse(permisosStorage) ?? false
  }

  verificarEvento(){
    const entidadId = this.route.snapshot.params['id'];
    const entidadIdNumber = Number(entidadId);
    if (isNaN(entidadIdNumber)) {
      this.router.navigate(['/eventos']);
      return;
    }

    this.eventoId = entidadIdNumber
    this.obtenerEventoService()
  }

  obtenerEventoService(){    
    this.eventoService.obtenerEvento(this.eventoId.toString())
      .subscribe( resp => {        
        this.pagination.eventoId = `${this.eventoId}`,
        resp.success ? this.evento = resp.data : this.router.navigate(['/eventos'])
        if(resp.data){
          this.obtenerIntervencionEspacioService()
        }
      })
  }

  obtenerEventoSectoresServices(){
    const paginationEventoSector:Pagination = { eventoId: this.eventoId.toString(), columnSort: 'eventoSectorId', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.eventoSectorService.listarEventoSectores(paginationEventoSector).subscribe( resp => this.eventosSectores.set(resp.data))
  }

  onBack(){
    this.router.navigate(['/eventos/', this.evento.eventoId])
  }

  obtenerIntervencionEspacioService(){
    this.loading = true
    this.intervencionEspaciosServices.ListarIntervencionEspacios({...this.pagination })
      .subscribe( resp => {           
        this.loading = false
        this.intervencionesEspacios.set(resp.data)
        this.pagination.total = resp.info?.total
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    
  }

  procesarIntervencion(){

  }

  reporteIntervencion(){

  }

  crearIntervencion(){
    let intervencionEspacio: IntervencionEspacioResponse = {} as IntervencionEspacioResponse
    intervencionEspacio.origen = '0'
    intervencionEspacio.eventoId = this.eventoId.toString()
    intervencionEspacio.tipoEventoId = this.evento.codigoTipoEvento!
    intervencionEspacio.tipoIntervencion = '1'  // Proyecto
    
    this.intervencionEspacioFormModal(intervencionEspacio)
  }

  intervencionEspacioFormModal(intervencionEspacio: IntervencionEspacioResponse, create: boolean = true){    
    const action = `${create ? 'Crear' : 'Actualizar' } Intervencion`
        this.modal.create<FormularioIntervencionComponent>({
          nzTitle: `${action.toUpperCase()}`,
          nzWidth: '50%',
          nzContent: FormularioIntervencionComponent,
          nzData: {
            create,
            // origen: { origen: 'acuerdos', interaccionId: this.eventoId.toString(), eventoId: this.eventoId.toString() },
            intervencionEspacio,
            sectores: this.eventosSectores().map(item => item.sectorId),
            ubigeos: []
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
                const formIntervencionEspacio = componentResponse!.formIntervencionEspacio
    
                if (formIntervencionEspacio.invalid) {
                  const invalidFields = Object.keys(formIntervencionEspacio.controls).filter(field => formIntervencionEspacio.controls[field].invalid);
                  console.error('Invalid fields:', invalidFields);
                  return formIntervencionEspacio.markAllAsTouched();
                }

                const origen = 'acuerdos'   
                const inicioIntervencionFaseId = null
                const objetivoIntervencionFaseId = null
                const usuarioIdRegistro = localStorage.getItem('codigoUsuario')!
                const bodyIntervencionEspacio: IntervencionEspacioResponse = {...formIntervencionEspacio.getRawValue(), origen, inicioIntervencionFaseId, objetivoIntervencionFaseId, usuarioIdRegistro  }
                if(create){
                  this.registrarIntervencionEspacio(bodyIntervencionEspacio)
                }
              }
            }
          ]
        })
  }

  registrarIntervencionEspacio(intervencionEspacio: IntervencionEspacioResponse) {
    this.intervencionEspaciosServices.registrarIntervencionEspacio(intervencionEspacio)
      .subscribe(resp => {
        if (resp.success) {
          this.obtenerIntervencionEspacioService()
          this.modal.closeAll()
        }
      });
  }

  intervencionDetalle(intervencionEspacio: IntervencionEspacioResponse){

  }

  comentarIntervencion(intervencionEspacio: IntervencionEspacioResponse){

  }

  eliminarIntervencion(intervencionEspacio: IntervencionEspacioResponse){
    this.modal.confirm({
      nzTitle: `Eliminar tarea`,
      nzContent: `¿Está seguro de que desea eliminar la tarea ${intervencionEspacio.codigoIntervencion}?`,
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.eliminarIntervencionService(intervencionEspacio.intervencionEspacioId!)
      },
      nzCancelText: 'Cancelar'
    });
  }

  eliminarIntervencionService(intervencionEspacioId:string){
    this.intervencionEspaciosServices.eliminarIntervencionEspacio(intervencionEspacioId)
      .subscribe( resp => {
        if(resp.success){
          this.obtenerIntervencionEspacioService()
        }
      })
  }
}
