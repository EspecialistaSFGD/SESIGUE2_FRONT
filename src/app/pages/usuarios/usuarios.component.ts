import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Pagination, UsuarioResponse } from '@core/interfaces';
import { UsuariosService } from '@core/services/usuarios.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { FiltrosUsuarioComponent } from './filtros-usuario/filtros-usuario.component';
import saveAs from 'file-saver';
import { UtilesService } from '@libs/shared/services/utiles.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PageHeaderComponent, FiltrosUsuarioComponent],
  templateUrl: './usuarios.component.html',
  styles: ``
})
export default class UsuariosComponent {
  title: string = `Lista de Puntos focales`;
    
  loadingData: boolean = false
  loadingExport: boolean = false
  openFilter:boolean = false

  usuarios = signal<UsuarioResponse[]>([])
    private utilesService = inject(UtilesService);

  pagination: Pagination = {
    columnSort: 'nombresPersona',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  private usuariosService = inject(UsuariosService)

  ngOnInit(): void {
    this.obtenerUsuariosService()
    
  }

  obtenerUsuariosService(){
    this.loadingData = true
    this.usuariosService.listarUsuario(this.pagination)
      .subscribe( resp => {
        this.loadingData = false        
        this.usuarios.set(resp.data)
        this.pagination.total = resp.info?.total
      })
  }

  reporteUsuarios(tipo: string){
    this.pagination.tipo = tipo
    this.loadingExport = true
    this.usuariosService.reporteUsuarios(this.pagination)
      .subscribe( resp => {
        this.loadingExport = false
        if(resp.data){
          const data = resp.data;
          this.generarExcel(data.archivo, data.nombreArchivo);
          this.loadingExport = false
        }
      })
  }

  generarExcel(archivo: any, nombreArchivo: string): void {
      const arrayBuffer = this.utilesService.base64ToArrayBuffer(archivo);
      const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, nombreArchivo);
  }
}
