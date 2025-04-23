import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MesaResponse } from '@core/interfaces';
import { MesasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-mesa-inversiones',
  standalone: true,
  imports: [CommonModule, NgZorroModule, SharedModule],
  templateUrl: './mesa-inversiones.component.html',
  styles: ``
})
export default class MesaInversionesComponent {
  title: string = `Inversiones`;
  
  authUserId = localStorage.getItem('codigoUsuario')
  mesaId!: number
  mesa = signal<MesaResponse>({
    codigo: '',
    nombre: '',
    estadoInternoNombre: '',
    estadoInterno: '',
    fechaRegistro: new Date()
  })

  private mesaServices = inject(MesasService)
    private route = inject(ActivatedRoute)
    private router = inject(Router)

  ngOnInit(): void {
    this.verificarMesa()
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

  getIframeInversiones() {
    return `http://52.168.137.104:300/SESIGUEOLDTEST/SD/Form_registrosInversion.aspx?au=0&7B611A09B990B80849DBE7AF822D63E466D552839D9EC6E0=2B6AC8BbF4ADF440005AFC42EF337555FB0008BF9770791Z&gjXtIkEroS=SD_SSFD&iacp=1314&imo=${this.mesaId}`
  }
}
