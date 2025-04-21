import { CommonModule } from '@angular/common';
import { Component, inject, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MesaDetalleResponse, MesaFilesResponse, MesaResponse, Pagination } from '@core/interfaces';
import { MesaDetallesService, MesasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-mesa-detalles',
  standalone: true,
  imports: [CommonModule, RouterModule , NgZorroModule, SharedModule],
  templateUrl: './mesa-detalles.component.html',
  styles: ``
})
export default class MesaDetallesComponent {
  title: string = `Mesas`;

  files: MesaFilesResponse[] = [
    {id: '1', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Dario', fecha: '07/03/2024' },
    {id: '2', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Denisse', fecha: '22/02/2024' },
    {id: '3', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Cecilia', fecha: '15/01/2024' },
    {id: '4', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Pamela', fecha: '28/12/2023' },
    {id: '5', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Veronica', fecha: '12/11/2023' },
  ]

  mesa!:MesaResponse
  mesasSesion = signal<MesaDetalleResponse[]>([])
  mesasAm = signal<MesaDetalleResponse[]>([])

  loadingData: boolean = false

  paginationSesion: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  paginationAm: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  private mesaServices = inject(MesasService)
  private mesaDetalleServices = inject(MesaDetallesService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)

  ngOnInit(): void {
    this.verificarMesa()
    this.obtenerDetalleMesa(0)
    this.obtenerDetalleMesa(1)
  }

  verificarMesa(){
    const mesaId = this.route.snapshot.params['id'];
    const mesaIdNumber = Number(mesaId);
    if (isNaN(mesaIdNumber)) {
      this.router.navigate(['/mesas']);
      return;
    }
    
    this.mesaServices.obtenerMesa(mesaId)
      .subscribe( resp => {
        if(resp.success){
          this.mesa = resp.data
        } else {
          this.router.navigate(['/mesas']);
        }
      })
  }

  obtenerDetalleMesa(tipo: number){
    this.loadingData = true
    const pagination = tipo == 1 ? this.paginationAm : this.paginationSesion
    this.mesaDetalleServices.ListarMesas(this.mesa.mesaId!, pagination)
      .subscribe( resp => {
        tipo == 1 ? this.mesasAm.set(resp.data) : this.mesasSesion.set(resp.data)
        tipo == 1 ? this.paginationAm.total = resp.info!.total : this.paginationSesion.total = resp.info!.total

        this.loadingData = false
      })
  }
}
