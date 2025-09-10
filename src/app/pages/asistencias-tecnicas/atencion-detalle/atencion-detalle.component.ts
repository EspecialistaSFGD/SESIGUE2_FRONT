import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AsistenciaTecnicaResponse } from '@core/interfaces';
import { AsistenciasTecnicasService, AuthService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-atencion-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule],
  templateUrl: './atencion-detalle.component.html',
  styles: ``
})
export default class AtencionDetalleComponent {
  asistenciaTecnicaId: number = 0
  asistenciaTecnica: AsistenciaTecnicaResponse = {} as AsistenciaTecnicaResponse
  
  private asistenciaTecnicaService = inject(AsistenciasTecnicasService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private authStore = inject(AuthService)


  ngOnInit(): void {
    this.verificarAtencion()
  }

  verificarAtencion(){
    const asistenciaTecnicaId = this.route.snapshot.params['id'];
    const atencionIdNumber = Number(asistenciaTecnicaId);
    if (isNaN(atencionIdNumber)) {
      this.router.navigate(['/atenciones']);
      return;
    }

    this.asistenciaTecnicaId = atencionIdNumber
    this.obtenerAtencionService()
  }

  obtenerAtencionService(){
    this.asistenciaTecnicaService.obtenerAsistenciaTecnica(this.asistenciaTecnicaId.toString())
      .subscribe( resp => {
        if(resp.success){
          console.log(resp);
          
          this.asistenciaTecnica = resp.data
        } else {
          this.router.navigate(['/atenciones']);
        }
      })
  }

  onBack(){
    this.router.navigate(['/atenciones'])
  }
}