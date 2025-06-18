import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IntervencionEspacioResponse, MesaResponse, Pagination } from '@core/interfaces';
import { PipesModule } from '@core/pipes/pipes.module';
import { IntervencionEspacioService, MesaIntegrantesService, MesasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioIntervencionComponent } from '../../intervenciones/formulario-intervencion/formulario-intervencion.component';
import { MesaDetalleComponent } from '../mesa-detalles/mesa-detalle/mesa-detalle.component';
import { arrayDeleteDuplicates } from '@core/helpers';
import saveAs from 'file-saver';
import { UtilesService } from '@libs/shared/services/utiles.service';

@Component({
  selector: 'app-agendas-mesa',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, SharedModule, PipesModule, MesaDetalleComponent],
  templateUrl: './agendas-mesa.component.html',
  styles: ``
})
export default class AgendasMesaComponent {
  title: string = `Agenda de la mesa`;

  authUserId = localStorage.getItem('codigoUsuario')
  mesaId!: number
  loadingIntervencionEspacio: boolean = false
  sectores:number[] = []
  ubigeos:string[] = []
  loadingExport: boolean = false

  fechaSincronizacion: string = ''

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
    usuarioId: this.authUserId!
  })

  intervencionesEspacios = signal<IntervencionEspacioResponse[]>([])

  pagination: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1
  }

  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private mesaServices = inject(MesasService)
  private mesaIntegranteServices = inject(MesaIntegrantesService)
  private intervencionEspaciosServices = inject(IntervencionEspacioService)
  private modal = inject(NzModalService);
  private utilesService = inject(UtilesService);

  ngOnInit(): void {
    this.verificarMesa()
    this.pagination.origenId = '1'
    this.pagination.interaccionId = `${this.mesaId}`
    this.obtenerMesaIntegrantesService(true)
    this.obtenerMesaIntegrantesService(false)
    this.obtenerIntervencionEspacioService()
  }

  verificarMesa(){
    const mesaId = this.route.snapshot.params['id'];
    const mesaIdNumber = Number(mesaId);
    if (isNaN(mesaIdNumber)) {
      this.router.navigate(['/mesas']);
      return;
    }

    this.mesaId = mesaIdNumber    
    this.mesaServices.obtenerMesa(mesaId)
      .subscribe( resp => {
        if(resp.success){
          this.mesa.set(resp.data)
        } else {
          this.router.navigate(['/mesas']);
        }
      })
  }

  obtenerMesaIntegrantesService(sector: boolean){
    const esSector = sector ? '1' : '0'
    this.mesaIntegranteServices.ListarMesaIntegrantes(this.mesaId.toString(), {...this.pagination, pageSize: 100, esSector})
      .subscribe( resp => {
        sector
        ? this.sectores = Array.from(new Set(resp.data.map( item => Number(item.sectorId))))
        : this.ubigeos = Array.from(new Set(resp.data.map( item => item.ubigeo!.slice(0,2))))
      })
  }

  obtenerIntervencionEspacioService(){
    this.loadingIntervencionEspacio = true
    this.intervencionEspaciosServices.ListarIntervencionEspacios({...this.pagination, columnSort: 'intervencionEspacioId'})
      .subscribe( resp => {        
        this.loadingIntervencionEspacio = false
        this.intervencionesEspacios.set(resp.data)
      })
  }

  intervencionDetalle(intervencionEspacioId: string){
    this.router.navigate(['intervenciones', intervencionEspacioId], {
      queryParams: {
        modelo: 'mesas',
        modeloId: this.mesa().mesaId
      }
    });
  }

  procesarIntervencion(){
    const pagination:Pagination = { origenId: '1', interaccionId: this.mesaId.toString() }
    this.intervencionEspaciosServices.procesarIntervencionEspacio(pagination)
      .subscribe( resp => {
        this.fechaSincronizacion = resp.data.fecha
        this.obtenerIntervencionEspacioService()
      })
  }

  reporteIntervencion(){
    this.loadingExport = true;
    this.intervencionEspaciosServices.reporteIntervencionEspacios(this.pagination)
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

  crearIntervencion(){
    this.intervencionEspacioForm(true)
  }

  intervencionEspacioForm(create: boolean){    
    const action = `${create ? 'Crear' : 'Actualizar' } Intervencion`
    this.modal.create<FormularioIntervencionComponent>({
      nzTitle: `${action.toUpperCase()}`,
      nzWidth: '50%',
      nzContent: FormularioIntervencionComponent,
      nzData: {
        create,
        origen: { origen: 'mesas', interaccionId: this.mesaId.toString(), eventoId: this.mesa().eventoId },
        sectores: this.sectores,
        ubigeos: this.ubigeos
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

            const intervencionEspacio: IntervencionEspacioResponse = {...formIntervencionEspacio.getRawValue() }
            const usuarioId = localStorage.getItem('codigoUsuario')!
            if(create){
              intervencionEspacio.usuarioIdRegistro = usuarioId
              this.registrarIntervencionEspacio(intervencionEspacio)
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
}
