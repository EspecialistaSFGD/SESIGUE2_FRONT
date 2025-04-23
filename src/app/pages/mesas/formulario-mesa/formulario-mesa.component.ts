import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { EntidadResponse, Pagination, SectorResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, SectoresService, UbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-formulario-mesa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule],
  templateUrl: './formulario-mesa.component.html',
  styles: ``
})
export class FormularioMesaComponent {

  filesList: NzUploadFile[] = [];

  sectores = signal<SectorResponse[]>([])
  entidadesSector = signal<EntidadResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private fb = inject(FormBuilder)
  private sectoresService = inject(SectoresService)
  private entidadesService = inject(EntidadesService)
  private ubigeosService = inject(UbigeosService)

  formMesa: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    resolucion: ['', Validators.required],
    sectorId: [null, Validators.required],
    secretariaTecnicaId: [{ value: null, disabled: true }, Validators.required],
    departamento: [null, Validators.required],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }],
    ubigeo: ['', Validators.required],
    fechaCreacion: ['', Validators.required],
    fechaVigencia: ['', Validators.required],
  })

  ngOnInit(): void {
    this.obtenerSectoresService()
    this.obtenerDepartamentoService()
  }

  obtenerSectoresService(){
    this.sectoresService.getAllSectors()
      .subscribe( resp => {
        this.sectores.set(resp.data)
      })
  }

  obtenerDepartamentoService(){
    this.ubigeosService.getDepartments()
      .subscribe( resp => {
        this.departamentos.set(resp.data)
      })
  }

  alertMessageError(control: string) {
    return this.formMesa.get(control)?.errors && this.formMesa.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formMesa.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  beforeUploadMeet = (file: NzUploadFile): boolean => {
    const archivo = this.formMesa.get('resolucion')
    archivo?.setValue(file)
    this.filesList = []
    this.filesList = this.filesList.concat(file);
    return false;
  };

  changeSector(){
    const sectorControl = this.formMesa.get('sectorId')?.value
    const secretariaControl = this.formMesa.get('secretariaTecnicaId')
    if(sectorControl){
      this.obtenerEntidadService(sectorControl)
      secretariaControl?.enable()
    } else {
      secretariaControl?.disable()
      secretariaControl?.reset()
    }
  }

  obtenerEntidadService(sectorId: number){
    const params:Pagination = {
      entidadId: 0,
      tipo: '1',
      sectorId
    }
    this.entidadesService.listarEntidades(params)
      .subscribe( resp => {
        this.entidadesSector.set(resp.data)
      })
  }

  changeDepartamento(){
    const departamento = this.formMesa.get('departamento')?.value
    const provinciaControl = this.formMesa.get('provincia')
    const distritoControl = this.formMesa.get('distrito')
    let ubigeo = null 
    if(departamento){
      ubigeo = `${departamento}0000`
      this.obtenerProvinciaService(departamento)
      provinciaControl?.enable()
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
    }
    
    this.formMesa.get('ubigeo')?.setValue(ubigeo)
    distritoControl?.disable()
    distritoControl?.reset()
  }

  obtenerProvinciaService(departamento: string){
    this.ubigeosService.getProvinces(departamento)
      .subscribe( resp => {
        this.provincias.set(resp.data)
      })
  }

  changeProvincia(){
    const departamento = this.formMesa.get('departamento')?.value
    let ubigeo = `${departamento.departamentoId}0000`
    const provincia = this.formMesa.get('provincia')?.value
    const distritoControl = this.formMesa.get('distrito')    
    if(provincia){
      ubigeo = provincia
      distritoControl?.enable()
      this.obtenerDistritosService(ubigeo)
    } else {
      distritoControl?.disable()
      distritoControl?.reset()
    }    
    this.formMesa.get('ubigeo')?.setValue(ubigeo)
  }

  obtenerDistritosService(provincia: string){
    this.ubigeosService.getDistricts(provincia)
      .subscribe( resp => {
        this.distritos.set(resp.data)
      })
  }

  changeDistrito(){
    const provincia = this.formMesa.get('provincia')?.value
    const distrito = this.formMesa.get('distrito')?.value   
    const ubigeo = distrito ? distrito : provincia
    this.formMesa.get('ubigeo')?.setValue(ubigeo)
  }
}
