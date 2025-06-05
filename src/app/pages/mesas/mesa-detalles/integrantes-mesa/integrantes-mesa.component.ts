import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { MesaResponse, MesaUbigeoResponse, Pagination } from '@core/interfaces';
import { MesaUbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-integrantes-mesa',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './integrantes-mesa.component.html',
  styles: ``
})
export class IntegrantesMesaComponent {
  @Input() mesaId!: number
  @Input() esSector:boolean = true

  loading: boolean = false
  pagination: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  integrantes = signal<MesaUbigeoResponse[]>([])

  private integrantesService = inject(MesaUbigeosService)

  ngOnInit(): void {
    this.obtenerIntegrantesService()
  }

  obtenerIntegrantesService(){
    this.loading = true
    this.pagination.esSector = this.esSector ? '1' : '0'
    this.integrantesService.ListarMesaUbigeos(this.mesaId.toString(), this.pagination)
      .subscribe( resp => {
        console.log(resp.data);                
        this.loading = false
        this.integrantes.set(resp.data)
        this.pagination.total = resp.info!.total
      })
  }
}
