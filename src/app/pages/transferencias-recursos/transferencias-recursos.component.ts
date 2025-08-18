import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FileResponse, Pagination, TransferenciaRecursoResponse } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { IndiceTransferenciaRecursoComponent } from './indice-transferencia-recurso/indice-transferencia-recurso.component';
import { TransferenciaRecursoService } from '@core/services';
import { UtilesService } from '@libs/shared/services/utiles.service';
import saveAs from 'file-saver';
import { PipesModule } from '@core/pipes/pipes.module';
import { BotonDescargarComponent } from '@shared/boton/boton-descargar/boton-descargar.component';

@Component({
  selector: 'app-transferencias-recursos',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, NgZorroModule, PipesModule, BotonDescargarComponent],
  templateUrl: './transferencias-recursos.component.html',
  styles: ``
})
export default class TransferenciasRecursosComponent {

  loading: boolean = false

  transferenciasRecursos = signal<TransferenciaRecursoResponse[]>([])
  
  pagination: Pagination = {
    columnSort: 'recursoId',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  
  private transferenciaRecurso = inject(TransferenciaRecursoService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private modal = inject(NzModalService) 
  private utilesService = inject(UtilesService);

  ngOnInit(): void {
    this.obtenerRecursos()
  }

  obtenerRecursos(){
    this.transferenciaRecurso.ListarTransferenciasRecurso({...this.pagination, pageSize: 13, columnSort: 'grupoID' })
      .subscribe( resp => {
        this.transferenciasRecursos.set(resp.data)
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    
  }

  generarMov(transferenciaId: string){
    this.transferenciaRecurso.GenerarMov(transferenciaId,this.pagination)
      .subscribe( resp => {
        if(resp.data){
          this.generarDescarga(resp.data);
        }
      })
  }

  generarDescarga(archivo: FileResponse): void {    
    const arrayBuffer = this.utilesService.base64ToArrayBuffer(archivo.archivo);
    const blob = new Blob([arrayBuffer], { type: archivo.contentType });
    saveAs(blob, archivo.nombreArchivo);
  }

  agregarTransferenciaIndice(indice: boolean = true){
    const title = indice ? 'NUEVO INDICE' : 'NUEVA PROYECCIÓN'
    this.modal.create<IndiceTransferenciaRecursoComponent>({
      nzTitle: title,
      nzMaskClosable: false,
      nzContent: IndiceTransferenciaRecursoComponent,
      nzData: { indice },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Guardar',
          type: 'primary',
          onClick: (componentResponse) => {
            const formIndice = componentResponse!.formIndice
           
            if (formIndice.invalid) {
              const invalidFields = Object.keys(formIndice.controls).filter(field => formIndice.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formIndice.markAllAsTouched();
            }

            console.log(formIndice);
            
          }
        }
      ]
    })
  }
}