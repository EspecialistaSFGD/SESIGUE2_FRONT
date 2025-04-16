import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MesaFilesResponse, MesaResponse, Pagination } from '@core/interfaces';
import { MesasService } from '@core/services';
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

  loadingData: boolean = false

  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

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
    
    this.mesaServices.obtenerMesa(mesaId)
      .subscribe( resp => {
        if(resp.success){
          this.mesa = resp.data
        } else {
          this.router.navigate(['/mesas']);
        }
      })
  }
}
