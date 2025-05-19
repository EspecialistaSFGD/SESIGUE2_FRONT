import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IntervencionTareaAvanceResponse, IntervencionTareaResponse, Pagination } from '@core/interfaces';
import { IntervencionTareaAvanceService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-intervencion-tarea-avances',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule],
  templateUrl: './intervencion-tarea-avances.component.html',
  styles: ``
})
export default class IntervencionTareaAvancesComponent {
  @Input() intervencionTarea: IntervencionTareaResponse | null = null

  loadindAvances: boolean = false

  intervencionTareasAvances = signal<IntervencionTareaAvanceResponse[]>([])

  private intervencionTareaAvanceServices = inject(IntervencionTareaAvanceService)

  paginationAvance: Pagination = {
    columnSort: 'intervencionAvanceId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  ngOnInit(): void {    
    if(this.intervencionTarea!.intervencionTareaId){
      this.paginationAvance.intervencionTareaId = this.intervencionTarea!.intervencionTareaId
      this.obtenerInversionTareaAvanceService()
    }
  }

  obtenerInversionTareaAvanceService(){
    this.loadindAvances = true
    this.intervencionTareaAvanceServices.ListarIntervencionTareas(this.paginationAvance)
      .subscribe( resp => {
        this.loadindAvances = false
        this.intervencionTareasAvances.set(resp.data)
        this.paginationAvance.total = resp.info!.total
      })
  }

  agregarAvance(){
    
  }
}
