import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { EventoDetalleComponent } from './evento-detalle/evento-detalle.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@libs/services/auth/auth.service';
import { EventosService } from '@core/services';
import { EventoResponse } from '@core/interfaces';

@Component({
  selector: 'app-evento-detalles',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, EventoDetalleComponent],
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
    this.obtenerEntidadService()
  }

  obtenerEntidadService(){
    console.log(this.eventoId);
    
    this.eventoService.obtenerEvento(this.eventoId.toString())
      .subscribe( resp => {
        console.log(resp);
        
        resp.success ? this.evento = resp.data : this.router.navigate(['/eventos'])
      })
  }
}
