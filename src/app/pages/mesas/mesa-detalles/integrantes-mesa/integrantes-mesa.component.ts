import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { MesaResponse, MesaIntegranteResponse, Pagination, ButtonsActions, UsuarioNavigation } from '@core/interfaces';
import { MesaIntegrantesService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioIntegranteMesaComponent } from './formulario-integrante-mesa/formulario-integrante-mesa.component';
import { AuthService } from '@libs/services/auth/auth.service';
import { obtenerPermisosBotones } from '@core/helpers';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

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

  permisosPCM: boolean = false
  perfilAuth: number = 0

  mesasActions: ButtonsActions = {}
  mesasIntegrantesActions: ButtonsActions = {}

  integrantes = signal<MesaIntegranteResponse[]>([])
  modal = inject(NzModalService);

  integrante: MesaIntegranteResponse = {
    mesaId: '',
    entidadId: '',
    alcaldeAsistenteId: '',
    esSector: this.esSector
  }

  loading: boolean = false
  pagination: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  private integrantesService = inject(MesaIntegrantesService)
  private authStore = inject(AuthService)

  ngOnInit(): void {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.permisosPCM = this.setPermisosPCM()
    this.obtenerIntegrantesService()
    this.getPermissions()
  }

  setPermisosPCM(){
    const profilePCM = [11,12,23]
    return profilePCM.includes(this.perfilAuth)
  }

  getPermissions() {
      // const navigation = this.authStore.navigationAuth()!
      const navigation:UsuarioNavigation[] = JSON.parse(localStorage.getItem('menus') || '')
      const menu = navigation.find((nav) => nav.descripcionItem.toLowerCase() == 'mesas')
      this.mesasActions = obtenerPermisosBotones(menu!.botones!)
  
      const menuLevel = menu!.children!.find(nav => nav.descripcionItem?.toLowerCase() == 'mesa integrantes')
      this.mesasIntegrantesActions = obtenerPermisosBotones(menuLevel!.botones!)
    }

  obtenerIntegrantesService(){
    this.loading = true
    this.pagination.esSector = this.esSector ? '1' : '0'
    this.integrantesService.ListarMesaIntegrantes(this.mesaId.toString(), this.pagination)
      .subscribe( resp => {               
        this.loading = false
        this.integrantes.set(resp.data)
        this.pagination.total = resp.info!.total
      })
  }

  nuevoIntegrante(){
    this.integrante = { mesaId: '', entidadId: '', alcaldeAsistenteId: '', dni: '', nombres: '', apellidos: '', telefono: '', esSector: this.esSector }
    this.formularioIntegrante()
  }

  actualizarIntegrante(integrante: MesaIntegranteResponse){
    this.integrante = integrante
    this.formularioIntegrante(false)
  }

  formularioIntegrante(create: boolean = true){
    const tipo =  this.esSector ? 'GN' : 'GR/GL'
    const title = create ? 'Agregar' : 'Actualizar'
    this.modal.create<FormularioIntegranteMesaComponent>({
      nzTitle: `${title.toUpperCase()} INTEGRANTE ${tipo}`,
      nzWidth: '50%',
      nzContent: FormularioIntegranteMesaComponent,
      nzData: {
        create: create,
        integrante: this.integrante,
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: `${title} integrante`,
          type: 'primary',
          onClick: (componentResponse) => {
            const formIntegrante = componentResponse!.formIntegrante         

            if (formIntegrante.invalid) {
              const invalidFields = Object.keys(formIntegrante.controls).filter(field => formIntegrante.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formIntegrante.markAllAsTouched();
            }

            const alcaldeAsistenteId = `${formIntegrante.get('alcaldeAsistenteId')?.value}`
            const esSector = this.esSector
            const mesaId = this.integrante.mesaId

            const bodyIntegrante: MesaIntegranteResponse = { ...formIntegrante.getRawValue(), alcaldeAsistenteId, esSector, mesaId }
            if(create){
              this.createIntegranteService(bodyIntegrante)
            } else {
              bodyIntegrante.mesaIntegranteId = this.integrante.mesaIntegranteId
              this.actualizarIntegranteService(bodyIntegrante)
            }
          }
        }
      ]
    })
  }


  createIntegranteService(integrante: MesaIntegranteResponse){
    this.integrantesService.registarMesaIntegrante(this.mesaId.toString(), integrante)
      .subscribe( resp => {
        if(resp.success == true){
          this.obtenerIntegrantesService()
          this.modal.closeAll()
        }
      })
  }

  actualizarIntegranteService(integrante: MesaIntegranteResponse){    
    this.integrantesService.actualizarMesaIntegrante(integrante)
      .subscribe( resp => {
        if(resp.success == true){
          this.obtenerIntegrantesService()
          this.modal.closeAll()
        }
      })
  }

  eliminarIntegrante(integrante: MesaIntegranteResponse){    
    const tipo =  this.esSector ? 'GN' : 'GR/GL'
    this.modal.confirm({
      nzTitle: `Eliminar ${tipo}`,
      nzContent: `¿Está seguro de que desea eliminar ${integrante.nombres}?`,
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.integrantesService.eliminarMesaIntegrante(integrante.mesaIntegranteId!)
          .subscribe( resp => {
            if(resp.success){
              this.obtenerIntegrantesService()
            }
          })
      },
      nzCancelText: 'Cancelar'
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
      const sortsNames = ['ascend', 'descend']
      const sorts = params.sort.find(item => sortsNames.includes(item.value!))
      const qtySorts = params.sort.reduce((total, item) => {
        return sortsNames.includes(item.value!) ? total + 1 : total
      }, 0)
      const campo = sorts?.key
      const ordenar = sorts?.value!.slice(0, -3)
      
      this.pagination.pageSize = params.pageSize
      this.pagination.currentPage = params.pageIndex
      // this.pagination.typeSort = ordenar
      // this.pagination.columnSort = campo
      this.obtenerIntegrantesService()
      // this.paramsNavigate({...filtros, pagina: params.pageIndex, cantidad: params.pageSize, campo, ordenar, save: null })
    }
}
