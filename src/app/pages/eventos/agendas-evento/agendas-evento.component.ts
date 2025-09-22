import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoResponse } from '@core/interfaces';
import { EventosService } from '@core/services';
import { EventoDetalleComponent } from '../evento-detalles/evento-detalle/evento-detalle.component';
import { AuthService } from '@libs/services/auth/auth.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-agendas-evento',
  standalone: true,
  imports: [CommonModule, EventoDetalleComponent, NgZorroModule],
  templateUrl: './agendas-evento.component.html',
  styles: ``
})
export default class AgendasEventoComponent {
  evento: EventoResponse = {} as EventoResponse

  eventoId:number = 0
  esSsfgd:boolean = false
  
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private authStore = inject(AuthService)
  private eventoService = inject(EventosService)

  ngOnInit(): void {
    this.getPermisosPCM()
    this.verificarEvento()
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
        resp.success ? this.evento = resp.data : this.router.navigate(['/eventos'])
      })
  }

  onBack(){
    this.router.navigate(['/eventos/', this.evento.eventoId])
  }
}
