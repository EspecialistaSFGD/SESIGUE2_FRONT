import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ColorEstados, MesaResponse, Pagination } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaComponent } from './formulario-mesa/formulario-mesa.component';
import { MesasService } from '@core/services/mesas.service';
import { EstadoTagComponent } from "../../shared/estado-tag/estado-tag.component";
import { SharedModule } from '@shared/shared.module';
import { DescargarService } from '@core/services';
import { UtilesService } from '@libs/shared/services/utiles.service';
import saveAs from 'file-saver';
import { generateBase64ToArrayBuffer } from '@core/helpers';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, PageHeaderComponent, SharedModule],
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
    columnSort: 'nombre',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  mesas = signal<MesaResponse[]>([])

  private authStore = inject(AuthService)
  private modal = inject(NzModalService);
  private mesasService = inject(MesasService)
  private descargarService = inject(DescargarService)

  ngOnInit(): void {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.permisosPCM = this.setPermisosPCM()
    this.obtenerMesasService()
  }

  setPermisosPCM(){
    const profilePCM = [11,12,23]
    return profilePCM.includes(this.perfilAuth)
  }

  obtenerMesasService(){
    this.mesasService.ListarMesas(this.pagination)
      .subscribe( resp => {
        this.mesas.set(resp.data)
        this.pagination.total = resp.info?.total
      })
  }

  descargarPdf(archivo: string){
    this.descargarService.descargarPdf(archivo)
      .subscribe((resp) => {        
        if (resp.success == true) {
          var binary_string = generateBase64ToArrayBuffer(resp.data.binario);
          var blob = new Blob([binary_string], { type: `application/${resp.data.tipo}` });
          saveAs(blob, resp.data.nombre);
        }
      })
  }

  crearMesa(){
    this.mesasFormModal(true)
  }

  mesasFormModal(create: boolean): void{
    const action = `${create ? 'Crear' : 'Actualizar' } mesa`
    const modal = this.modal.create<FormularioMesaComponent>({
      nzTitle: `${action.toUpperCase()}`,
      nzWidth: '50%',
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
            const formMesa = componentResponse!.formMesa
            
            if (formMesa.invalid) {
              const invalidFields = Object.keys(formMesa.controls).filter(field => formMesa.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formMesa.markAllAsTouched();
            }
            
            const nombre = formMesa.get('nombre')?.value

            this.loadingData = true
            this.mesasService.registarMesa(nombre)
              .subscribe( resp => {
                this.loadingData = false
                if(resp.success == true){
                  this.obtenerMesasService()
                  this.modal.closeAll()
                }
              })            
          }
        }
      ]
    })
  }
}
