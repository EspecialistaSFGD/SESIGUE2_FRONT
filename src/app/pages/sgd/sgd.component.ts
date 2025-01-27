import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonsActions, Pagination } from '@core/interfaces';
import { CargaMasivaResponse } from '@core/interfaces/carga-masiva.interface';
import { CargasMasivasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import CargaMasivaComponent from './carga-masiva/carga-masiva.component';
import { AuthService } from '@libs/services/auth/auth.service';

@Component({
  selector: 'app-sgd',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, NgZorroModule, CargaMasivaComponent ],
  templateUrl: './sgd.component.html',
  styles: ``
})
export default class SgdComponent {

  title: string = `Sistema de Gestión Documentaria`;
  cargasMasivas = signal<CargaMasivaResponse[]>([])

  loadingData: boolean = false
  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  sgdActions: ButtonsActions = {
      view: false,
      upload: false
    }

  cargaMasivaDetail!: CargaMasivaResponse

  confirmModal?: NzModalRef;
  showNzModalBulkUpload: boolean = false

  private fb = inject(FormBuilder)
  private cargaMasivaService = inject(CargasMasivasService)
  private authStore = inject(AuthService)
  
  
    public navigationAuth = computed(() => this.authStore.navigationAuth())

  ngOnInit(): void {
    this.getPermissions()
    this.getBulkUpload()
  }

  getPermissions() {
    const navigation = this.authStore.navigationAuth()!
    const atenciones = navigation.find(nav => nav.descripcionItem.toLowerCase() == 'sgd')
    atenciones?.botones?.map(btn => {
      this.sgdActions.view = btn.descripcionBoton === 'Ver' ? true : this.sgdActions.view
      this.sgdActions.upload = btn.descripcionBoton === 'Subir' ? true : this.sgdActions.upload
    })
  }

  getBulkUpload(){    
    this.loadingData = true
    this.cargaMasivaService.getAllCargasMasivas(this.pagination)
      .subscribe((resp) => {    
        this.loadingData = false
        this.cargasMasivas.set(resp.data)
        this.pagination.total = resp.info!.total
    })
  }

  getAddFormAdded(success: boolean) {
    if (success) {
      this.getBulkUpload()
      this.showNzModalBulkUpload = true
    }
  }
}
