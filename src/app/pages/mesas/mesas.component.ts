import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ColorEstados, MesaResponse, Pagination } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaComponent } from './formulario-mesa/formulario-mesa.component';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, RouterModule , NgZorroModule, PageHeaderComponent],
  templateUrl: './mesas.component.html',
  styles: ``
})
export default class MesasComponent {
  title: string = `Mesas`;
  
  loadingData: boolean = false
  permisosPCM: boolean = false
  perfilAuth: number = 0

  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  mesas = signal<MesaResponse[]>([])

  private authStore = inject(AuthService)
  private modal = inject(NzModalService);
  
  // mesas:MesaResponse[] = [
  //   { nombre: 'Mesa Técnica para el Desarrollo de la Provinicia de Condorcanqui - Amazonas', estadoInternoNombre: 'seguimiento' },
  //   { nombre: 'Mesa Técnica para el Desarrollo Integral de la provincia de Vilcas Huamán del departamento de Ayacucho', estado: 'proceso' },
  //   { nombre: 'Mesa Técnica para el Desarrollo   Territorial de la provincia de Urubamba del   departamento de Cusco', estado: 'cerrado' },
  //   { nombre: 'Subgrupo de Trabajo 3: Plan de Desarrollo del “Espacio de diálogo para el desarrollo de la provincia de Cotabambas y distrito de Progreso de la provincia de Grau del departamento de Apurímac', estado: 'seguimiento' },
  // ]

  colorEstado(estado: string): ColorEstados{
    let theme: ColorEstados = {
    color: 'warning',
    icon: 'sync'
    };
    switch (estado) {
    case 'cerrado':
      theme.color = 'success'
      theme.icon = 'check-circle'
      break;
    case 'seguimiento':
      theme.color = 'processing'
      theme.icon = 'like'
      break;
    }
    return theme
  }

  ngOnInit(): void {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.permisosPCM = this.setPermisosPCM()
  }

  setPermisosPCM(){
    const profilePCM = [11,12,23]
    return profilePCM.includes(this.perfilAuth)
  }

  crearMesa(){
    this.mesasFormModal(true)
  }

  mesasFormModal(create: boolean): void{
    const action = `${create ? 'Crear' : 'Actualizar' } mesa`
    const modal = this.modal.create<FormularioMesaComponent>({
      nzTitle: `${action.toUpperCase()}`,
      // nzWidth: '75%',
      nzContent: FormularioMesaComponent,
      nzData: {
        create,
        authUser: this.authStore.usuarioAuth()
      },
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
            console.log(componentResponse);                
          }
        }
      ]
    })
  }
}
