import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IntervencionEspacioResponse, MesaResponse, Pagination } from '@core/interfaces';
import { PipesModule } from '@core/pipes/pipes.module';
import { IntervencionEspacioService, MesasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioIntervencionComponent } from '../../intervenciones/formulario-intervencion/formulario-intervencion.component';
import { MesaDetalleComponent } from '../mesa-detalles/mesa-detalle/mesa-detalle.component';

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

  private mesaServices = inject(MesasService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private intervencionEspaciosServices = inject(IntervencionEspacioService)
  private modal = inject(NzModalService);

  ngOnInit(): void {
    this.verificarMesa()
    this.obtenerIntervencionEspacioServicio()
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

  obtenerIntervencionEspacioServicio(){
    this.loadingIntervencionEspacio = true
    this.intervencionEspaciosServices.ListarIntervencionEspacios(this.pagination)
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
        origen: { origen: 'mesas', interaccionId: this.mesaId.toString() },
        create
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
          this.obtenerIntervencionEspacioServicio()
          this.modal.closeAll()
        }
      });
  }
}
