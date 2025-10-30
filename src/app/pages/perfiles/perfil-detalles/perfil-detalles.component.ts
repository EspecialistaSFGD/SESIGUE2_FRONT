import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PerfilResponse } from '@core/interfaces';
import { PerfilesService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PerfilDetalleComponent } from './perfil-detalle/perfil-detalle.component';
import { AccesosPerfilComponent } from './accesos-perfil/accesos-perfil.component';

@Component({
  selector: 'app-perfil-detalles',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PerfilDetalleComponent, AccesosPerfilComponent],
  templateUrl: './perfil-detalles.component.html',
  styles: ``
})
export default class PerfilDetallesComponent {
  perfilId:number = 0
  perfil: PerfilResponse = {} as PerfilResponse

  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private perfilService = inject(PerfilesService)

  ngOnInit(): void {
    this.verificarPerfil()
  }

  verificarPerfil(){
    const entidadId = this.route.snapshot.params['id'];
    const entidadIdNumber = Number(entidadId);
    if (isNaN(entidadIdNumber)) {
      this.router.navigate(['perfiles']);
      return;
    }

    this.perfilId = entidadIdNumber
    this.obtenerPerfilService()
  }
  
  obtenerPerfilService(){
    this.perfilService.obtenerPerfil(this.perfilId.toString())
      .subscribe( resp => {
        resp.success ? this.perfil = resp.data : this.router.navigate(['perfiles'])
      })
  }

  onBack(){
    this.router.navigate(['perfiles'])
  }
}
