import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MesaDocumentoTipoEnum } from '@core/enums';
import { convertEnumToObject } from '@core/helpers';
import { ItemEnum, MesaResponse, Pagination } from '@core/interfaces';
import { MesaDocumentosService, MesasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DocumentosMesaComponent } from "./documentos-mesa/documentos-mesa.component";
import { IntegrantesMesaComponent } from "./integrantes-mesa/integrantes-mesa.component";
import { MesaDetalleComponent } from "./mesa-detalle/mesa-detalle.component";

@Component({
  selector: 'app-mesa-detalles',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, IntegrantesMesaComponent, MesaDetalleComponent, DocumentosMesaComponent],
  templateUrl: './mesa-detalles.component.html',
  styles: ``
})
export default class MesaDetallesComponent {
  title: string = `Mesas`;

  mesaId!: number
  tipos: ItemEnum[] = convertEnumToObject(MesaDocumentoTipoEnum)

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
    usuarioId: ''
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
    this.obtenerMesaService()
  }

  obtenerMesaService(){    
    this.mesaServices.obtenerMesa(this.mesaId.toString())
      .subscribe( resp => {
        if(resp.success){
          this.mesa.set(resp.data)
        } else {
          this.router.navigate(['/mesas']);
        }
      })
  }

  updateDetalle(actualizar: boolean){
    if(actualizar){
      this.obtenerMesaService()
    }
  }

}
