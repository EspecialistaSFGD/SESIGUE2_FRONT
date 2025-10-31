import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccesoResponse, PerfilResponse } from '@core/interfaces';
import { AccesosService, PerfilesService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AccesoDetallePerfilComponent } from './acceso-detalle-perfil/acceso-detalle-perfil.component';
import { AccesoDetalleAccesoPerfilComponent } from './acceso-detalle-acceso-perfil/acceso-detalle-acceso-perfil.component';

@Component({
  selector: 'app-acceso-detalles-perfil',
  standalone: true,
  imports: [CommonModule, NgZorroModule, AccesoDetallePerfilComponent, AccesoDetalleAccesoPerfilComponent],
  templateUrl: './acceso-detalles-perfil.component.html',
  styles: ``
})
export default class AccesoDetallesPerfilComponent {
  perfilId:number = 0
  perfil: PerfilResponse = {} as PerfilResponse

  accesoId:number = 0
  acceso: AccesoResponse = {} as AccesoResponse

  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private perfilService = inject(PerfilesService)
  private accesoService = inject(AccesosService)

  ngOnInit(): void {
    this.verificarPerfil()
  }

  verificarPerfil(){
    const perfilId = this.route.snapshot.params['id'];
    const accesoId = this.route.snapshot.params['accesoId'];
    const perfilIdNumber = Number(perfilId);
    const accesoIdNumber = Number(accesoId);
    if (isNaN(accesoIdNumber)) {
      this.router.navigate(['perfiles',perfilId]);
      return;
    }

    this.perfilId = perfilIdNumber
    this.accesoId = accesoId
    this.obtenerPerfilService()
    this.obtenerAccesoService()
  }

  obtenerPerfilService(){
    this.perfilService.obtenerPerfil(this.perfilId.toString())
      .subscribe( resp => {
        resp.success ? this.perfil = resp.data : this.router.navigate(['perfiles'])
      })
  }

  obtenerAccesoService(){
    this.accesoService.obtenerAcceso(this.accesoId.toString())
      .subscribe( resp => {
        resp.success ? this.acceso = resp.data : this.router.navigate(['perfiles',this.perfilId])
      })
  }

  onBack(){
    this.router.navigate(['perfiles',this.perfilId])
  }
}
