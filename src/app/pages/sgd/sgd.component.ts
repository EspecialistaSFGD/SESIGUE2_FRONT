import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Pagination } from '@core/interfaces';
import { CargaMasivaResponse } from '@core/interfaces/carga-masiva.interface';
import { CargasMasivasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import CargaMasivaComponent from './carga-masiva/carga-masiva.component';

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

  cargaMasivaDetail!: CargaMasivaResponse

  confirmModal?: NzModalRef;
  showNzModalBulkUpload: boolean = false

  private fb = inject(FormBuilder)
  private cargaMasivaService = inject(CargasMasivasService)

  ngOnInit(): void {
    this.getBulkUpload()
  }

  getBulkUpload(){    
    this.loadingData = true
    this.cargaMasivaService.getAllAsistenciasTecnicas(this.pagination)
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
