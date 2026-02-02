import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntidadResponse, Pagination } from '@core/interfaces';
import { EntidadesService } from '@core/services';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { EntidadDetalleComponent } from './entidad-detalle/entidad-detalle.component';
import { AuthService } from '@libs/services/auth/auth.service';
import { EntidadAutoridadComponent } from "./entidad-autoridad/entidad-autoridad.component";

@Component({
  selector: 'app-entidad-detalles',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, EntidadDetalleComponent, EntidadAutoridadComponent],
  templateUrl: './entidad-detalles.component.html',
  styles: ``
})
export default class EntidadDetallesComponent {
  entidadId: number = 0
  permisosPCM: boolean = false
  esSsfgd:boolean = false
  entidad: EntidadResponse = {} as EntidadResponse
  
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private entidadService = inject(EntidadesService)
  private authStore = inject(AuthService)

  ngOnInit(): void {
    this.verificarEntidad()
  }

  getPermisosPCM(){
    const perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    const ssfgdPCM = [11,12,23]
    this.esSsfgd = ssfgdPCM.includes(perfilAuth)

    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    return JSON.parse(permisosStorage) ?? false
  }

  verificarEntidad(){
    const entidadId = this.route.snapshot.params['id'];
    const entidadIdNumber = Number(entidadId);
    if (isNaN(entidadIdNumber)) {
      this.router.navigate(['/entidades']);
      return;
    }

    this.entidadId = entidadIdNumber
    this.obtenerEntidadService()
  }

  obtenerEntidadService(){
    this.entidadService.obtenerEntidad({ entidadId: this.entidadId })
      .subscribe( resp => {
        resp.success ? this.entidad = resp.data : this.router.navigate(['/entidades'])
      })
  }
}
