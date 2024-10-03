import { Component, inject, signal } from '@angular/core';
import { AsistenciasTecnicasClasificacion, AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos, AsistenciaTecnicaResponse } from '@interfaces/asistencia-tecnica.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { AsistenciasTecnicasService } from '@services/asistencias-tecnicas.service';
import { PageHeaderComponent } from '@shared/layout/page-header/page-header.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormularioAsistenciaTecnicaComponent } from './formulario-asistencia-tecnica/formulario-asistencia-tecnica.component';
import { CommonModule } from '@angular/common';
import { ItemEnums, Sorts } from '@interfaces/helpers.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { UbigeosService } from '@services/ubigeos.service';
import { UbigeoDepartamentoResponse } from '@interfaces/ubigeo.interface';

@Component({
  selector: 'app-asistencia-tecnica',
  standalone: true,
  templateUrl: './asistencias-tecnicas.component.html',
  styles: ``,
  imports: [
    CommonModule,
    PageHeaderComponent,
    NzTableModule,
    NzSpaceModule,
    NzButtonModule,
    NzIconModule,
    FormularioAsistenciaTecnicaComponent
  ]
})
export class AsistenciasTecnicasComponent {
  title: string = `Lista de Asistencias Técnicas`;
  sorts:ItemEnums[] = Object.entries(Sorts).map(([value, text]) => ({ value: value.toLowerCase(), text }));
  tipos:ItemEnums[] = Object.entries(AsistenciasTecnicasTipos).map(([value, text]) => ({ value: value.toLowerCase(), text }));
  modalidades:ItemEnums[] = Object.entries(AsistenciasTecnicasModalidad).map(([value, text]) => ({ value: value.toLowerCase(), text }));
  clasificaciones:ItemEnums[] = Object.entries(AsistenciasTecnicasClasificacion).map(([value, text]) => ({ value: value.toLowerCase(), text }));
  public departamentos = signal<UbigeoDepartamentoResponse[]>([])
  public asistenciasTecnicas = signal<AsistenciaTecnicaResponse[]>([])
  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaAtencion',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }
  getParams:boolean = false
  asistenciaId: number = 0
  showNzModal: boolean = false

  private asistenciaTecnicaService = inject(AsistenciasTecnicasService)
  private ubigeoService = inject(UbigeosService)
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)

  ngOnInit() {
    this.verifyParams()
    this.obtenerAsistenciasTecnicas()
    this.getAllDepartamentos()
  }
  verifyParams(){
    this.activatedRoute.queryParams.subscribe(params => {
      this.getParams = params['pageSize'] ? true : false;      
    })
  }

  obtenerAsistenciasTecnicas() {
    this.asistenciaTecnicaService.getAllAsistenciasTecnicas(this.pagination)
      .subscribe(resp => {
        if (resp.success == true) {
          this.asistenciasTecnicas.set(resp.data)      
          const { pageIndex, pageSize, total } = resp.info!
          this.pagination.currentPage = pageIndex
          this.pagination.pageSize = pageSize
          this.pagination.total = total
        } else {
          this.pagination.currentPage = 1
          this.pagination.pageSize = 10
          this.pagination.total = 0
        }
      })
  }

  getAllDepartamentos(){
    this.ubigeoService.getAllDepartamentos()
      .subscribe( resp => {
        if(resp.success == true){
          this.departamentos.set(resp.data)
        }
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    // this.getParams = true
    console.log(params);
    let sort = Sorts.descend.toString()
    if(this.getParams){
      for(let filter of params.sort){
        this.sorts.find( ({value, text}) => {
          if(value == filter.value){
            sort = text
          }
        })
      }

      
      
    }
    console.log(this.getParams);
  }

  setQueryParams(params: any){
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: 'merge'
    })
  }

  getTextEnum(value:string, kind:string):string{
    let text = value    
    if(kind == 'tipo'){
      text = this.tipos.find(item => item.value === value)!.text      
    } else if(kind == 'modalidad'){
      text = this.modalidades.find(item => item.value === value)!.text      
    } else if(kind == 'clasificacion'){
      text = this.clasificaciones.find(item => item.value === value)!.text      
    }
    return text;
  }

  verifySaveData(saved: boolean){
    if(saved){
      this.obtenerAsistenciasTecnicas()
    }
  }
}
