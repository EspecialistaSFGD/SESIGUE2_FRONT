import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Renderer2, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AtencionCargaMasivaResponse, Pagination } from '@core/interfaces';
import { CargaMasivaResponse } from '@core/interfaces/carga-masiva.interface';
import { PipesModule } from '@core/pipes/pipes.module';
import { CargasMasivasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-carga-masiva-detalles',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PipesModule],
  templateUrl: './carga-masiva-detalles.component.html',
  styles: ``
})
export default class CargaMasivaDetallesComponent {

  cargaMasivaId: string;
  loadingData: boolean = false;

  cargaMasiva = signal<CargaMasivaResponse>({
    id: '',
    estado: '',
    nombreArchivo: '',
    directorioArchivo: '',
    nombreTabla: '',
    totalFilas: 0,
    filasGuardadas: 0,
    fechaRegistro: new Date()
  })

  
  pagination: Pagination = {
    code: 0,
    total: 0,
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1
  }

  cargaMasivaDetail = signal<AtencionCargaMasivaResponse[]>([])

  private http = inject(HttpClient)
  private router = inject(Router)
  private activatedRoute = inject(ActivatedRoute)
  private cargaMasivaService = inject(CargasMasivasService)
  private renderer = inject(Renderer2)

  constructor() {
    this.cargaMasivaId = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.getParams()
  }

  ngOnInit(): void {
    this.getcargaMasiva()
    this.obtenerAtencionesCargaMasiva()
  }

  getParams() {
    this.loadingData = true
    this.activatedRoute.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        const campo = params['campo'] ?? 'fechaRegistro'
        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'
        this.obtenerAtencionesCargaMasiva()
      }
    });
  }

  getcargaMasiva(){
    this.cargaMasivaService.getCargaMasiva(this.cargaMasivaId)
      .subscribe((resp) => {
        if(resp.success == true){
          this.cargaMasiva.set(resp.data)      
        } else{
          this.router.navigate(['/sgd']);
        }   
      })
  }

  obtenerAtencionesCargaMasiva(){
    this.loadingData = true
    this.cargaMasivaService.atencionesCargaMasiva(this.cargaMasivaId, this.pagination)
      .subscribe((resp) => {
        if(resp.success == true){
          this.loadingData = false
          this.cargaMasivaDetail.set(resp.data!)
          this.pagination.total = resp.info!.total
        }      
      })
  }

  async downloadFile(url: string, fileName:string): Promise<void> {

    try {
      const response = await firstValueFrom(
        this.http.get(url, { responseType: 'blob' })
      );

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });   

      const link = this.renderer.createElement('a');
      const objectURL = URL.createObjectURL(blob);

      this.renderer.setAttribute(link, 'href', objectURL);
      this.renderer.setAttribute(link, 'download', fileName);

      this.renderer.appendChild(document.body, link);
      link.click();
      this.renderer.removeChild(document.body, link);

      // Liberar la URL creada
      URL.revokeObjectURL(objectURL);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
    }
  }

  replaceToNewLine(text:string): string{
    const newText = text.replace(/\n/g, '<br>')
    return newText
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
      const sortsNames = ['ascend', 'descend']
      const sorts = params.sort.find(item => sortsNames.includes(item.value!))
      const qtySorts = params.sort.reduce((total, item) => {
        return sortsNames.includes(item.value!) ? total + 1 : total
      }, 0)
      const ordenar = sorts?.value!.slice(0, -3)
      this.router.navigate(
        [],
        {
          relativeTo: this.activatedRoute,
          queryParams: { pagina: params.pageIndex, cantidad: params.pageSize, campo: sorts?.key, ordenar }
        }
      );
    }
}
