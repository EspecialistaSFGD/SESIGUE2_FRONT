import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccesoDetalleResponse, AccesoResponse, Pagination } from '@core/interfaces';
import { AccesoDetalleService, AccesosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-acceso-detalles',
  standalone: true,
  imports: [CommonModule, NgZorroModule, BotonComponent],
  templateUrl: './acceso-detalles.component.html',
  styles: ``
})
export default class AccesoDetallesComponent {
  accesoId:number = 0
  acceso:AccesoResponse = {} as AccesoResponse
  
  loading: boolean = false
  openFilters: boolean = false

  pagination: Pagination = {
    columnSort: 'codigoAccesoDetalle',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  accesoDetalles = signal<AccesoDetalleResponse[]>([])

  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private accesoService = inject(AccesosService)
  private accesoDetalleService = inject(AccesoDetalleService)

  ngOnInit(): void {
    this.verificarAcceso()
  }

  verificarAcceso(){
    const accesoId = this.route.snapshot.queryParams['acceso'];
    const accesoIdNumber = Number(accesoId);
    if (isNaN(accesoIdNumber)) {
      this.router.navigate(['/perfiles']);
      return;
    }

    this.accesoId = accesoIdNumber
    this.obtenerAccesoService()
    setTimeout(() => this.getParams())
  }

  obtenerAccesoService(){
    this.accesoService.obtenerAcceso(this.accesoId.toString())
      .subscribe( resp => {
        resp.success ? this.acceso = resp.data : this.router.navigate(['acceso',this.acceso.perfilId])
      })
  }

  getParams() {
    this.route.queryParams
      .pipe(
        filter(params => Object.keys(params).length > 0),
        distinctUntilChanged((prev,curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe( params => {        
        this.listarAccesoDetallesServices()
    })
  }

  listarAccesoDetallesServices(){
  this.loading = true
  this.accesoDetalleService.ListarAccesoDetalle({...this.pagination, accesoId: this.accesoId.toString()})
    .subscribe( resp => {
      this.loading = false
      this.accesoDetalles.set(resp.data)
      this.pagination.total = resp.info?.total
    })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)

    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filterStorageExist = localStorage.getItem('filtrosAccesoDetalles');
    let filtros:Pagination = this.pagination
    if(filterStorageExist){      
      filtros = JSON.parse(filterStorageExist)
      filtros.save = false      
      localStorage.setItem('filtrosAccesoDetalles', JSON.stringify(filtros))
    }

    this.pagination = {...filtros, currentPage: params.pageIndex, pageSize: params.pageSize }
  }

  agregarBoton(){
    this.botonFormModal(true)
  }

  botonFormModal(create: boolean): void{
    const action = `${create ? 'Agregar' : 'Actualizar' } boton`
    // this.modal.create<FormularioBotonesComponent>({
    //   nzTitle: `${action.toUpperCase()}`,
    //   nzMaskClosable: false,
    //   nzContent: FormularioBotonesComponent,
    //   nzData: {
    //     create,
    //   },
    //   nzFooter: [
    //     {
    //       label: 'Cancelar',
    //       type: 'default',
    //       onClick: () => this.modal.closeAll(),
    //     },
    //     {
    //       label: action,
    //       type: 'primary',
    //       onClick: (componentResponse) => {
    //       }
    //     }
    //   ]
    // })
  }

  onBack(){
    this.router.navigate(['accesos'], { queryParams: { perfil: this.acceso.perfilId } })
  }
}
