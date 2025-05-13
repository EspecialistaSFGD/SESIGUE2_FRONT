import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { InversionTareaResponse, Pagination } from '@core/interfaces';
import { InversionTareaService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';

@Component({
  selector: 'app-inversion-tareas',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PageHeaderComponent],
  templateUrl: './inversion-tareas.component.html',
  styles: ``
})
export default class InversionTareasComponent {
  title: string = `Tareas`;
  @Input() inversionId!:string

  loadingTareas: boolean =  false
  
  paginationTareas: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }
  
  inversionTareas = signal<InversionTareaResponse[]>([])

  private inversionTareasServices = inject(InversionTareaService)

  ngOnInit(): void {
    this.obtenerInversionTareasService()
  }

  obtenerInversionTareasService(){
    this.loadingTareas = true
    this.inversionTareasServices.ListarInversionFase({...this.paginationTareas, inversionId: this.inversionId})
      .subscribe( resp => {
        this.loadingTareas = false
        this.inversionTareas.set(resp.data)
        this.paginationTareas.total = resp.info?.total
      })
  }
}
