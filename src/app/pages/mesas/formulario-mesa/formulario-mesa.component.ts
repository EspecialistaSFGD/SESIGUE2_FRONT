import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  provincias = signal<UbigeoProvinciaResponse[][]>([])
  distritos = signal<UbigeoDistritoResponse[][]>([])

  private fb = inject(FormBuilder)
  private sectoresService = inject(SectoresService)
  private entidadesService = inject(EntidadesService)
  private ubigeosService = inject(UbigeosService)

  get ubigeos(): FormArray {
    return this.formMesa.get('ubigeos') as FormArray;
  }

  formMesa: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    resolucion: ['', Validators.required],
    sectorId: [null, Validators.required],
    secretariaTecnicaId: [{ value: null, disabled: true }, Validators.required],
    fechaCreacion: ['', Validators.required],
    fechaVigencia: ['', Validators.required],
    ubigeos: this.fb.array([]),
  })

  ngOnInit(): void {
    this.obtenerSectoresService()
    this.obtenerDepartamentoService()
    this.addUbigeo()
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

  alertMessageErrorTwoNivel(control: string, index: number, subcontrol: string) {
    const getControl = this.formMesa.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    return levelControl?.errors && levelControl?.touched
  }

  msgErrorControlTwoNivel(control: string, index: number, subcontrol: string, label?: string): string {
    const getControl = this.formMesa.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    const text = label ? label : subcontrol
    const errors = levelControl?.errors;

    return typeErrorControl(text, errors)
  }

  addItemFormArray(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.addUbigeo()
  }

  addUbigeo(){
    const ubigeo = this.fb.group({
      departamento: [null, Validators.required],
      provincia: [{ value: null, disabled: true }],
      distrito: [{ value: null, disabled: true }],
      ubigeo: ['', Validators.required],
    })
    this.ubigeos.push(ubigeo)
    this.provincias.update(provincia => [...provincia, []])
    this.distritos.update(distrito => [...distrito, []])
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

  changeDepartamento(index: number){
    const getControl = this.formMesa.get('ubigeos') as FormArray

    const departamentoControl = getControl.at(index).get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = getControl.at(index).get('provincia')
    const distritoControl = getControl.at(index).get('distrito')

    let ubigeo = null 
    if(departamentoValue){
      ubigeo = `${departamentoValue}0000`
      this.obtenerProvinciaService(departamentoValue, index)
      provinciaControl?.enable()
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
    }
    
    getControl.at(index).get('ubigeo')?.setValue(ubigeo)
    distritoControl?.disable()
    distritoControl?.reset()
  }

  obtenerProvinciaService(departamento: string, index: number){
    const copyProvincia = [...this.provincias()]
    const copyDistritos = [...this.distritos()]

    this.ubigeosService.getProvinces(departamento)
      .subscribe( resp => {

        if(resp.success){
          copyProvincia[index] = resp.data
          this.provincias.set(copyProvincia)

          copyDistritos[index] = []
          this.distritos.set(copyDistritos)
        }
      })
  }

  changeProvincia(index: number){
    const getControl = this.formMesa.get('ubigeos') as FormArray

    const departamentoControl = getControl.at(index).get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = getControl.at(index).get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = getControl.at(index).get('distrito')
   
    let ubigeo = `${departamentoValue}0000`
    if(provinciaValue){
      ubigeo = provinciaValue
      distritoControl?.enable()
      this.obtenerDistritosService(ubigeo, index)
    } else {
      distritoControl?.disable()
      distritoControl?.reset()
    }    
    getControl.at(index).get('ubigeo')?.setValue(ubigeo)
  }

  obtenerDistritosService(provincia: string, index: number){
    const copyDistritos = [...this.distritos()]

    this.ubigeosService.getDistricts(provincia)
      .subscribe( resp => {
        if(resp.success){
          copyDistritos[index] = resp.data
          this.distritos.set(copyDistritos)
        }
      })
  }

  changeDistrito(index: number){
    const getControl = this.formMesa.get('ubigeos') as FormArray
    const provinciaControl = getControl.at(index).get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = getControl.at(index).get('distrito')
    const distritoValue = distritoControl?.value

    const ubigeo = distritoValue ? distritoValue : provinciaValue
    getControl.at(index).get('ubigeo')?.setValue(ubigeo)
  }
}
