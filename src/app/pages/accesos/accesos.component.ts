import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccesoResponse, Pagination, PerfilResponse } from '@core/interfaces';
import { AccesosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-accesos',
  standalone: true,
  imports: [CommonModule, PrimeNgModule, NgZorroModule],
  templateUrl: './accesos.component.html',
  styles: ``
})
export default class AccesosComponent {
  // perfil: PerfilResponse = {} as PerfilResponse
  perfilId:number = 0
  
  loading: boolean = false
  openFilters: boolean = false

  pagination: Pagination = {
    columnSort: 'M.ordenItem',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  accesos = signal<AccesoResponse[]>([])

  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private accesoService = inject(AccesosService)


  ngOnInit(): void {
    
    this.verificarPerfil()
  }

  verificarPerfil(){
    const perfilId = this.route.snapshot.queryParams['perfil'];
    const perfilIdNumber = Number(perfilId);
    if (isNaN(perfilIdNumber)) {
      this.router.navigate(['/panel']);
      return;
    }

    this.perfilId = perfilIdNumber

    // this.mesaId = mesaIdNumber
    this.obtenerPerfilService()
    // this.getParams()
  }

  obtenerPerfilService(){    
    // this.mesaServices.obtenerMesa(this.mesaId.toString())
    //   .subscribe( resp => {
    //     if(resp.success){
    //       this.mesa.set(resp.data)
    //     } else {
    //       this.router.navigate(['/mesas']);
    //     }
    //   })
  }

  getParams() {
      this.route.queryParams
        .pipe(
          filter(params => Object.keys(params).length > 0),
          distinctUntilChanged((prev,curr) => JSON.stringify(prev) === JSON.stringify(curr))
        )
        .subscribe( params => {
          console.log(('params'));
          
          // this.obtenerMesasService()
      })
    }

  obtenerAccesosServices(){
    this.loading = true
    // this.accesoService.ListarAccesos({...this.pagination, perfilId: this.perfil.perfilId})
    //   .subscribe( resp => {
    //     this.loading = false
    //     this.accesos.set(resp.data)
    //     this.pagination.total = resp.info?.total
    //   })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)

    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filterStorageExist = localStorage.getItem('filtrosAccesos');
    let filtros:Pagination = this.pagination
    if(filterStorageExist){      
      filtros = JSON.parse(filterStorageExist)
      filtros.save = false      
      localStorage.setItem('filtrosAccesos', JSON.stringify(filtros))
    }
    
    this.pagination = {...filtros, currentPage: params.pageIndex, pageSize: params.pageSize }
    this.obtenerAccesosServices()
  }
}
