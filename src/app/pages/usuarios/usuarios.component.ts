import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Pagination, SectorResponse, UbigeoDepartmentResponse, UsuarioResponse } from '@core/interfaces';
import { UsuariosService } from '@core/services/usuarios.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { FiltrosUsuarioComponent } from './filtros-usuario/filtros-usuario.component';
import saveAs from 'file-saver';
import { UtilesService } from '@libs/shared/services/utiles.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SectoresService, UbigeosService } from '@core/services';

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
  sectores = signal<SectorResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])

  pagination: Pagination = {
    columnSort: 'nombresPersona',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private usuariosService = inject(UsuariosService)
  private utilesService = inject(UtilesService);
  private sectoresService = inject(SectoresService)
  private ubigeoService = inject(UbigeosService)

  ngOnInit(): void {
    this.obtenerSectoresService()
    this.obtenerDepartamentosService()
    this.getParams()
  }

  getParams() {
    this.route.queryParams.subscribe((params: Params) => {
      if (Object.keys(params).length > 0) {
        let columnSort = params['campo'] ?? 'nombresPersona'
        this.pagination.columnSort = columnSort
        this.pagination.currentPage = Number(params['pagina'])
        this.pagination.pageSize = Number(params['cantidad'])
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'
        
        this.obtenerUsuariosService()
      }
    });
  }

  obtenerDepartamentosService(){
    this.ubigeoService.getDepartments()
      .subscribe(resp => {
        this.departamentos.set(resp.data) 
      })
  }

  obtenerSectoresService(){
    this.sectoresService.getAllSectors(0, 2)
      .subscribe( resp => {
        this.sectores.set(resp.data)
        this.pagination.total = resp.info?.total
      }
    )
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

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.paramsNavigate({ pagina: pageIndex, cantidad: pageSize });
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
}
