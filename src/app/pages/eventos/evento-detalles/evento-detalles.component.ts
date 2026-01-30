import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventoResponse } from '@core/interfaces';
import { EventosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { EventoDetalleComponent } from './evento-detalle/evento-detalle.component';
import { EventoSectoresComponent } from './evento-sectores/evento-sectores.component';
import { EventoDiasComponent } from './evento-dias/evento-dias.component';
import { EventoGruposComponent } from './evento-grupos/evento-grupos.component';

@Component({
  selector: 'app-evento-detalles',
  standalone: true,
  imports: [CommonModule, RouterModule, EventoDetalleComponent, NgZorroModule, EventoSectoresComponent, EventoDiasComponent, EventoGruposComponent],
  templateUrl: './evento-detalles.component.html',
  styles: ``
})
export default class EventoDetallesComponent {

  esSsfgd:boolean = false
  eventoId:number = 0

  evento: EventoResponse = {} as EventoResponse

  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private authStore = inject(AuthService)
  private eventoService = inject(EventosService)

  ngOnInit(): void {
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
    this.router.navigate(['/eventos'])
  }
}
