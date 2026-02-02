import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination, ParametroResponse } from '@core/interfaces';
import { ParametrosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { MessageService } from 'primeng/api';
import { FormularioParametroComponent } from './formulario-parametro/formulario-parametro.component';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-parametros',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PrimeNgModule, PageHeaderComponent, BotonComponent ],
  providers: [MessageService],
  templateUrl: './parametros.component.html',
  styles: ``
})
export class ParametrosComponent {

  parametros = signal<ParametroResponse[]>([])

  loading: boolean = false
  pagination: Pagination = {
    columnSort: 'parametroId',
    typeSort: 'ASC',
    currentPage: 1,
    pageSize: 10,
  }

  private parametroService = inject(ParametrosService)
  private messageService = inject(MessageService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private modal = inject(NzModalService)
  private breakpoint = inject(BreakpointObserver)

  ngOnInit(): void {
    this.ontenerParametrosService()
  }

  ontenerParametrosService(){
    this.loading = true
    this.parametroService.listarParametros(this.pagination)
      .subscribe( resp => {
        this.loading = false
        this.parametros.set(resp.data);
        this.pagination.total = resp.info!.total
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    
  }

  parametroFormModal(parametro: ParametroResponse | null){
    const create = parametro ? false : true
    const action = `${create ? 'Crear' : 'Actualizar' } parametro`
    const widthModal = (this.breakpoint.isMatched('(max-width: 767px)')) ? '90%' : '50%'
    
    this.modal.create<FormularioParametroComponent>({
      nzTitle: `${action.toUpperCase()}`,
      nzWidth: widthModal,
      nzMaskClosable: false,
      nzContent: FormularioParametroComponent,
      nzData: { create, parametro },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: action,
          type: 'primary',
          onClick: (componentResponse) => {
            const formParametro = componentResponse!.formParametro

            if (formParametro.invalid) {
              const invalidFields = Object.keys(formParametro.controls).filter(field => formParametro.controls[field].invalid)
              console.error('Invalid fields:', invalidFields)
              return formParametro.markAllAsTouched()
            }

            console.log(formParametro.value);
            create ? this.guardarParametroService(formParametro.value) : this.actualizarParametroService({ ...parametro!, ...formParametro.value })
          }
        }
      ]
    })
  }

  guardarParametroService(parametro: ParametroResponse){
    this.parametroService.registrarParametro(parametro)
      .subscribe({
        next: (resp) => {
          this.messageService.add({ severity:'success', summary: 'Éxito', detail: 'Parámetro registrado correctamente' });
          this.ontenerParametrosService()
          this.modal.closeAll()
        },
        error: (err) => {
          this.messageService.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Error al registrar el parámetro' });
        }
      })
  }

  actualizarParametroService(parametro: ParametroResponse){
    this.parametroService.actualizarParametro(parametro)
      .subscribe({
        next: (resp) => {
          this.messageService.add({ severity:'success', summary: 'Éxito', detail: 'Parámetro actualizado correctamente' });
          this.ontenerParametrosService()
          this.modal.closeAll()
        },
        error: (err) => {
          this.messageService.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Error al actualizar el parámetro' });
        }
      })
  }
}
