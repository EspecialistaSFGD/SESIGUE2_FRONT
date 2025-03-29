import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MetaUsuarioResponse, Pagination, UsuarioMetaResponse } from '@core/interfaces';
import { UsuarioMetasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMetaComponent } from './formulario-meta/formulario-meta.component';
import { MetasDetallesComponent } from './metas-detalles/metas-detalles.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { dateZeroMonthDay } from '@core/helpers';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PageHeaderComponent],
  templateUrl: './metas.component.html',
  styles: ``
})
export default class MetasComponent {
  title: string = `Metas`;

  loadingData: boolean = false

  usuarios = signal<UsuarioMetaResponse[]>([])


  pagination: Pagination = {
    columnSort: 'nombresPersona',
    typeSort: 'ASC',
    pageSize: 16,
    currentPage: 1,
    total: 0
  }

  private usuarioMetasService = inject(UsuarioMetasService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private modal = inject(NzModalService);

  ngOnInit(): void {
    this.getParams()
  }

  getParams() {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        let campo = params['campo'] ?? 'nombresPersona'
        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'ASC'
        this.obtenerServiceUsuariosMeta()        
      }
    })
  }

  obtenerServiceUsuariosMeta(){
    this.loadingData = true
    this.usuarioMetasService.listarUsuario(this.pagination)
      .subscribe( resp => {
        this.loadingData = false
        this.usuarios.set(resp.data)
        this.pagination.total = resp.info?.total ?? 0
      })
  }

  onQueryParams(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const qtySorts = params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)
    const ordenar = sorts?.value!.slice(0, -3)   
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { pagina: params.pageIndex, cantidad: params.pageSize, campo: sorts?.key, ordenar }
      }
    );
  }

  modalMetaDetalle(usuarioId: string, nombre: string): void{
    const titleModal = nombre
    const modal = this.modal.create<MetasDetallesComponent>({
      nzTitle: titleModal,
      nzWidth: '50%',
      nzContent: MetasDetallesComponent,
      nzData: {
        usuarioId
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => {
            this.modal.closeAll(),
            this.obtenerServiceUsuariosMeta()
          }
        }
      ]
    })
  }

  modalNuevaMeta(){
    const modal = this.modal.create<FormularioMetaComponent>({
      nzTitle: 'Nueva Meta',
      nzWidth: '50%',
      nzContent: FormularioMetaComponent,
      nzData: {
        usuarios: this.usuarios()
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Agregar Meta',
          type: 'primary',
          onClick: (componentResp) => {
            const formNewmeta = componentResp!.formMeta
            
            if (formNewmeta.invalid) {
              return formNewmeta.markAllAsTouched()
            }
            
            const fecha = formNewmeta.get('fecha')?.value
            const usuarios = formNewmeta.get('usuarios')?.value

            const date = new Date(fecha)
            date.setMonth(date.getMonth() + 1)
            date.setDate(0)


            const fechaMeta = dateZeroMonthDay(date)
            for(let usuario of usuarios){
              const metaUsuario: MetaUsuarioResponse = {
                usuarioId: usuario.usuarioId,
                fecha: fechaMeta,
                meta: usuario.meta  
              }              
              this.usuarioMetasService.registarMetaUsuario(metaUsuario)
                .subscribe( resp => {
                  // console.log(resp);
                })
            }
            this.obtenerServiceUsuariosMeta()
            this.modal.closeAll()
          }
        }
      ]
    })
  }
}
