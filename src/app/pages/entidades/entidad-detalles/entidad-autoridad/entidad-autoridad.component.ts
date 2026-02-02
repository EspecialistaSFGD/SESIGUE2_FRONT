import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JneAutoridadTipoEnum } from '@core/enums';
import { obtenerAutoridadJne, obtenerUbigeoTipo } from '@core/helpers';
import { AsistenteResponse, AutoridadResponse, EntidadResponse, JneAutoridadResponse, Pagination } from '@core/interfaces';
import { AsistentesService, AutoridadesService, JneService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-entidad-autoridad',
  standalone: true,
  imports: [CommonModule, FormsModule, NgZorroModule, PrimeNgModule, BotonComponent],
  templateUrl: './entidad-autoridad.component.html',
  styles: ``
})
export class EntidadAutoridadComponent {
  @Input() entidad!: EntidadResponse;

  loading: boolean = false
  autoridades = signal<AutoridadResponse[]>([])
  autoridadJne = signal<JneAutoridadResponse>({} as JneAutoridadResponse)

  pagination:Pagination = {
    columnSort: 'autoridadId',
    typeSort: 'asc',
    currentPage: 1,
    pageSize: 10,
  }

  private autoridadService = inject(AutoridadesService)
  private jneService = inject(JneService)
  private asistenteService = inject(AsistentesService)

  ngOnInit(): void {
    this.pagination.entidadId = Number(this.entidad.entidadId)
    this.obtenerAutoridadesService()

    setTimeout(() => this.obtenerAutoridadJneService());
  }

  obtenerAutoridadesService(){
    this.loading = true
    this.autoridadService.listarAutoridad(this.pagination)
      .subscribe( resp => {
        this.loading = false
        this.autoridades.set(resp.data)
        this.pagination.total = resp.info!.total        
      })
  }

  obtenerAutoridadJneService(){
    const entidadTipo = this.entidad.entidadTipo!.toUpperCase()
    const tipoUbigeo = obtenerUbigeoTipo(this.entidad.ubigeo_jne!)

    let ubigeo = this.entidad.ubigeo_jne || this.entidad.ubigeo_oficial
    let tipo: JneAutoridadTipoEnum = JneAutoridadTipoEnum.REGION
    switch (entidadTipo) {
      case 'GR':
        tipo = JneAutoridadTipoEnum.REGION;
        ubigeo = `${tipoUbigeo.departamento}0000`;
      break;
      case 'MP':
        tipo = JneAutoridadTipoEnum.PROVINCIA;
        ubigeo = `${tipoUbigeo.provincia?.substring(0, 4)}00`;
      break;
      case 'MD':
        tipo = JneAutoridadTipoEnum.DISTRITO;
        ubigeo = tipoUbigeo.distrito!;
      break;
    }
    
    this.jneService.obtenerAutoridades({ ubigeo, tipo })
      .subscribe( resp => {
        const autoridadJne = obtenerAutoridadJne(resp.data)
        this.autoridadJne.set(autoridadJne)
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sort = params.sort.find(item => item.value == 'ascend')
    this.pagination.columnSort = sort ? sort.key : 'autoridadId'
    
    this.pagination.pageSize = params.pageSize
    this.pagination.currentPage = params.pageIndex
  }

  showVigente(autoridad: AutoridadResponse){
    console.log(autoridad);
    
  }

  obtenerAutoridadJne(){
    const asistenteParams: Pagination = { dni: this.autoridadJne().documentoIdentidad!, columnSort: 'asistenteId', typeSort: 'asc', currentPage: 1, pageSize: 1 }
    this.asistenteService.ListarAsistentes(asistenteParams)
      .subscribe( resp => {
        if(resp.data.length > 0){
          this.obtenerAutoridadPorDni(resp.data[0], false)
        } else {
          this.generarAsistente()
        }
      })
  }

  generarAsistente(){
    const asistente: AsistenteResponse = {
      dni: this.autoridadJne().documentoIdentidad,
      nombres: this.autoridadJne().nombres,
      apellidos: `${this.autoridadJne().apellidoPaterno} ${this.autoridadJne().apellidoMaterno}`,
      sexo: this.autoridadJne().sexo
    }

    this.obtenerAutoridadPorDni(asistente, true)
  }

  obtenerAutoridadPorDni(asistente: AsistenteResponse, create: boolean){
    this.jneService.obtenerAutoridadPorDni(this.autoridadJne().documentoIdentidad)
      .subscribe( resp => {
        const autoridadJne = resp.data
        asistente.nombres = autoridadJne.nombres
        asistente.apellidos = `${autoridadJne.apellidoPaterno} ${autoridadJne.apellidoMaterno}`
        asistente.sexo = autoridadJne.sexo
        autoridadJne.sexo = autoridadJne.sexo
        create ? this.crearAsistenteService({ ...asistente, dni: autoridadJne.documentoIdentidad }) : this.actualizarAsistenteService(asistente)
      })
  }

  crearAsistenteService(asistente: AsistenteResponse){
    this.asistenteService.registarAsistente(asistente)
      .subscribe( resp => {
        const asistenteRegistrado =  resp.data

        const autoridad: AutoridadResponse = {
          entidadId: `${this.entidad.entidadId}`,
          asistenteId: `${asistenteRegistrado.asistenteId}`,
          dni: this.autoridadJne().documentoIdentidad,
          nombres: this.autoridadJne().nombres,
          apellidos: `${this.autoridadJne().apellidoPaterno} ${this.autoridadJne().apellidoMaterno}`,
          cargo: this.autoridadJne().cargo,
          foto: this.autoridadJne().rutaFoto,
          partidoPolitico: this.autoridadJne().organizacionPolitica,
          vigente: true
        }

        this.crearAutoridadService(autoridad)
      })
  }

  actualizarAsistenteService(asistente: AsistenteResponse){
    this.asistenteService.actualizarAsistente(asistente)
      .subscribe( resp => {
        if(resp.success){
          this.obtenerAutoridad(resp.data)
        }
      })
  }

  obtenerAutoridad(asistente: AsistenteResponse){
    let asistenteAutoridad = this.autoridades().find(autoridad => autoridad.asistenteId == asistente.asistenteId)!
    asistenteAutoridad.cargo = this.autoridadJne().cargo
    asistenteAutoridad.foto = this.autoridadJne().rutaFoto
    asistenteAutoridad.partidoPolitico = this.autoridadJne().organizacionPolitica
    asistenteAutoridad.vigente = true
    this.actualizarAutoridadService(asistenteAutoridad)
  }
  
  crearAutoridadService(autoridad: AutoridadResponse){
    this.autoridadService.registarAutoridad(autoridad)
      .subscribe( resp => {
        if(resp.success){
          this.obtenerAutoridadesService()
        }
      })
  }

  actualizarAutoridadService(autoridad: AutoridadResponse){
    this.autoridadService.actualizarAutoridad(autoridad)
      .subscribe( resp => {
        if(resp.success){
          this.obtenerAutoridadesService()
        }
      })
  }
}
