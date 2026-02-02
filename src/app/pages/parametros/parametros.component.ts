import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ButtonsActions, ItemEnum, Pagination, ParametroResponse, UsuarioNavigation } from '@core/interfaces';
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
import { convertEnumToObject, obtenerPermisosBotones } from '@core/helpers';
import { ParametroTipoEnum } from '@core/enums';
import { distinctUntilChanged, filter } from 'rxjs';

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
  tipos: ItemEnum[] = convertEnumToObject(ParametroTipoEnum, true)

  parametrosActions: ButtonsActions = {}

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
    this.getPermissions()
    this.getParams()
  }

  getPermissions() {
    const navigation:UsuarioNavigation[] = JSON.parse(localStorage.getItem('menus') || '')
    const parametronav = navigation.find(nav => nav.codigo.toLowerCase() == 'parametros')    
    this.parametrosActions = parametronav && parametronav.botones ? obtenerPermisosBotones(parametronav!.botones!) : {}
  }

  getParams() {
    this.route.queryParams
      .pipe(
        filter(params => Object.keys(params).length > 0),
        distinctUntilChanged((prev,curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe( params => {
        this.loading = true
        let campo = params['campo'] ?? 'parametroId'
        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'

        this.obtenerParametrosService()
      })
  }

  obtenerParametrosService(){
    this.loading = true
    this.parametroService.listarParametros(this.pagination)
      .subscribe( resp => {
        this.loading = false
        this.parametros.set(resp.data);
        this.pagination.total = resp.info!.total
      })
  }

  obtenerTipo(tipo: string): string {
    const tipoItem = this.tipos.find(t => t.text === tipo)    
    return tipoItem ? tipoItem.value.toLowerCase() : tipo
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)

    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filterStorageExist = localStorage.getItem('filtrosParametros');
    let filtros:any = {}
    if(filterStorageExist){      
      filtros = JSON.parse(filterStorageExist)
      filtros.save = false      
      localStorage.setItem('filtrosParametros', JSON.stringify(filtros))
    }    
    this.paramsNavigate({...filtros, pagina: params.pageIndex, cantidad: params.pageSize, campo, ordenar, save: null })
  }

  paramsNavigate(queryParams: Params){    
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
      }
    );
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
          this.obtenerParametrosService()
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
          this.obtenerParametrosService()
          this.modal.closeAll()
        },
        error: (err) => {
          this.messageService.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Error al actualizar el parámetro' });
        }
      })
  }
}
