import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AsistenciasTecnicasClasificacion, AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos, AsistenciaTecnicaResponse, ItemEnum, Pagination } from '@core/interfaces';
import { CargaMasivaResponse } from '@core/interfaces/carga-masiva.interface';
import { CargasMasivasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import CargaMasivaComponent from './carga-masiva/carga-masiva.component';

@Component({
  selector: 'app-sgd',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, NgZorroModule, CargaMasivaComponent],
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

  confirmModal?: NzModalRef;
  tipos: ItemEnum[] = Object.entries(AsistenciasTecnicasTipos).map(([value, text]) => ({ value: value.toLowerCase(), text }))
  modalidaades: ItemEnum[] = Object.entries(AsistenciasTecnicasModalidad).map(([value, text]) => ({ value: value.toLowerCase(), text }))
  clasificaciones: ItemEnum[] = Object.entries(AsistenciasTecnicasClasificacion).map(([value, text]) => ({ value: value.toLowerCase(), text }))

  private cargaMasivaService = inject(CargasMasivasService)

  ngOnInit(): void {
    this.getBulkUpload()
  }

  getBulkUpload(){
    this.loadingData = true
    this.cargaMasivaService.getAllAsistenciasTecnicas(this.pagination)
      .subscribe((resp) => {
      this.loadingData = false
      console.log(resp);
      this.cargasMasivas.set(resp.data)
      this.pagination.total = resp.info!.total
    })
  }

  getTextEnum(value: string, kind: string): string {
    let text = value
    if (kind == 'tipo') {
      text = this.tipos.find(item => item.value.toLowerCase() == value)!.text
    } else if (kind == 'modalidad') {
      text = this.modalidaades.find(item => item.value.toLowerCase() == value)!.text
    } else if (kind == 'clasificacion') {
      text = this.clasificaciones.find(item => item.value.toLowerCase() == value)!.text
    }
    return text
  }
}
