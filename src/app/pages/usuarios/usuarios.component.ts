import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Pagination, UsuarioResponse } from '@core/interfaces';
import { UsuariosService } from '@core/services/usuarios.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { FiltrosUsuarioComponent } from './filtros-usuario/filtros-usuario.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PageHeaderComponent, FiltrosUsuarioComponent],
  templateUrl: './usuarios.component.html',
  styles: ``
})
export default class UsuariosComponent {
  title: string = `Lista de Usuarios`;
    
  loadingData: boolean = false
  openFilter:boolean = false

  usuarios = signal<UsuarioResponse[]>([])

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
}
