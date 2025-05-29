import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { EntidadResponse, Pagination, SectorResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { AlcaldesService, AsistentesService, EntidadesService, SectoresService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { ProgressSpinerComponent } from '@shared/progress-spiner/progress-spiner.component';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-formulario-mesa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule, ProgressSpinerComponent],
  templateUrl: './formulario-mesa.component.html',
  styles: ``
})
export class FormularioMesaComponent {

  filesList: NzUploadFile[] = [];

  listaSectores = signal<SectorResponse[]>([])
  listaEntidadesSector = signal<EntidadResponse[][]>([])
  entidadesSector = signal<EntidadResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[][]>([])
  distritos = signal<UbigeoDistritoResponse[][]>([])

  participar: string[] = ['si', 'no']
  activeStep: number = 0;

  private fb = inject(FormBuilder)
  private sectoresService = inject(SectoresService)
  private entidadesService = inject(EntidadesService)
  private ubigeosService = inject(UbigeosService)
  private alcaldesService = inject(AlcaldesService)
  private asistentesService = inject(AsistentesService)
  private validatorService = inject(ValidatorService)

  get sectores(): FormArray {
    return this.formMesa.get('sectores') as FormArray;
  }

  get ubigeos(): FormArray {
    return this.formMesa.get('ubigeos') as FormArray;
  }

  formMesa: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    resolucion: ['', Validators.required],
    sectorId: [null, Validators.required],
    // secretariaTecnicaId: [{ value: null, disabled: true }, Validators.required],
    secretariaTecnicaId: [ '', Validators.required],
    fechaCreacion: ['', Validators.required],
    fechaVigencia: ['', Validators.required],
    sectores: this.fb.array([]),
    ubigeos: this.fb.array([]),
  })

  ngOnInit(): void {
    this.obtenerSectoresService()
    this.obtenerDepartamentoService()
    this.addSectores()
    this.addUbigeo()
  }

  obtenerSectoresService(){
    this.sectoresService.getAllSectors().subscribe( resp => this.listaSectores.set(resp.data))
  }

  obtenerDepartamentoService(){
    this.ubigeosService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
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

  addItemFormArray(control: string, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    switch (control) {
      case 'sectores': this.addSectores(); break;
      case 'ubigeos': this.addUbigeo(); break;
    }
  }

  addSectores(){
    const sector = this.fb.group({
      sectorId: [null, Validators.required],
      entidadId: [ '', Validators.required],
      autoridad: [false, Validators.required],
      alcaldeAsistenteId: [ '' ],
      dni: ['', [Validators.required, Validators.pattern(this.validatorService.DNIPattern)]],
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      entidad: ['', Validators.required],
      esSector: [true, Validators.required],
    })
    this.sectores.push(sector)
    this.listaEntidadesSector.update(entidad => [...entidad, []])
  }

  addUbigeo(){
    const ubigeo = this.fb.group({
      entidadId: ['', Validators.required],
      alcaldeAsistenteId: [ '' ],
      departamento: [null, Validators.required],
      provincia: [{ value: null, disabled: true }],
      distrito: [{ value: null, disabled: true }],
      autoridad: [{ value: null, disabled: true }, Validators.required],
      dni: [{ value: null, disabled: true }, Validators.required],
      nombre: [{ value: null, disabled: true }, Validators.required],
      telefono: [{ value: null, disabled: true }, Validators.required],
      cargo: [{ value: null, disabled: true }, Validators.required],
      loading: [ false, Validators.required],
      entidad: ['', Validators.required],
      entidadSlug: [{ value: null, disabled: true }, Validators.required],
      esSector: [false, Validators.required],
    })
    this.ubigeos.push(ubigeo)
    this.provincias.update(provincia => [...provincia, []])
    this.distritos.update(distrito => [...distrito, []])
  }

  removeItemFormArray(index: number, formGroup: string){
    if (formGroup == 'sectores') {
      this.sectores.removeAt(index)
    } else if(formGroup == 'ubigeos'){
      this.ubigeos.removeAt(index)
    }
  }

  obtenerControlValue(index: number, formGroup: string, control:string){
    const controlArray = this.formMesa.get(formGroup) as FormArray;
    const getControl = controlArray.at(index).get(control);
    return getControl?.value
  }

  // validarAutoridad(index: number){
  //   const controlArray = this.formMesa.get('ubigeos') as FormArray;
  //   const autoridadControl = controlArray.at(index).get('autoridad');
  //   this.validarAutoridadInfo(index)
  // }

  validarAutoridad(index:number){
    const controlArray = this.formMesa.get('ubigeos') as FormArray;
    const autoridadControl = controlArray.at(index).get('autoridad');
    const dniControl = controlArray.at(index).get('dni');
    const nombreControl = controlArray.at(index).get('nombre');
    const telefonoControl = controlArray.at(index).get('telefono');
    const cargoControl = controlArray.at(index).get('cargo');
    const loadingControl = controlArray.at(index).get('loading');
    
    const entidadIdControl = controlArray.at(index).get('entidadId');
    const entidadValue = entidadIdControl?.value
    const autoridadValue = autoridadControl?.value;
    
    dniControl?.reset()
    nombreControl?.reset()
    telefonoControl?.reset()
    cargoControl?.reset()
    
    if(autoridadValue == true && entidadValue){  
      loadingControl?.setValue(true)
      setTimeout(() => {
        loadingControl?.setValue(false)
        this.obtenerAlcaldeServicio(index, controlArray)    
      }, 1000);
    }

    autoridadValue == false ? dniControl?.enable() : dniControl?.disable()
    autoridadValue == false ? nombreControl?.enable() : nombreControl?.disable()
    autoridadValue == false ? telefonoControl?.enable() : telefonoControl?.disable()
    autoridadValue == false ? cargoControl?.enable() : cargoControl?.disable()
  }

  validarDNI(index: number, formGroup: string) {
    const controlArray = this.formMesa.get(formGroup) as FormArray;
    const dniControl = controlArray.at(index).get('dni');
    const nombreControl = controlArray.at(index).get('nombre');
    const telefonoControl = controlArray.at(index).get('telefono');
    const alcaldeAsistenteIdControl = controlArray.at(index).get('alcaldeAsistenteId');

    const dniValue = dniControl?.value;

    if(dniValue && dniValue.length === 8) {
      if(formGroup === 'sectores') {
        this.obtenerAsistenteServicio(dniValue, index, controlArray)
      } else if(formGroup === 'ubigeos') {
        const autoridadControl = controlArray.at(index).get('autoridad');
        const autoridadValue = autoridadControl?.value;

        // if(autoridadValue != null && autoridadValue !== undefined) {
        //   autoridadValue
        //   ? this.obtenerAlcaldeServicio(index, controlArray)
        //   : this.obtenerAsistenteServicio(dniValue, index, controlArray);
        // }
        if(!autoridadValue){
          this.obtenerAsistenteServicio(dniValue, index, controlArray);
        }
      }
    } else {
      nombreControl?.reset();
      telefonoControl?.reset();
      alcaldeAsistenteIdControl?.reset();
    }
  }

  obtenerAsistenteServicio(dni: string, index: number, controlArray: FormArray) {
    const nombreControl = controlArray.at(index).get('nombre');
    const telefonoControl = controlArray.at(index).get('telefono');
    const alcaldeAsistenteIdControl = controlArray.at(index).get('alcaldeAsistenteId');
    const pagination: Pagination = { dni, columnSort: 'asistenteId', typeSort: 'ASC', pageSize: 10, currentPage: 1 }
    this.asistentesService.ListarAsistentes(pagination)
      .subscribe( resp => {
        const asistente = resp.data[0];
        nombreControl?.setValue(asistente?.nombres || '');
        telefonoControl?.setValue(asistente?.telefono || '');
        alcaldeAsistenteIdControl?.setValue(asistente?.asistenteId || '');
      })
  }

  obtenerAlcaldeServicio(index: number, controlArray: FormArray) {
    const entidadIdControl = controlArray.at(index).get('entidadId');
    const dniControl = controlArray.at(index).get('dni');
    const nombreControl = controlArray.at(index).get('nombre');
    const telefonoControl = controlArray.at(index).get('telefono');
    const cargoControl = controlArray.at(index).get('cargo');
    const entidadId = entidadIdControl?.value
    const alcaldeAsistenteIdControl = controlArray.at(index).get('alcaldeAsistenteId');

    const pagination: Pagination = { entidadId, columnSort: 'alcaldeId', typeSort: 'ASC', pageSize: 10, currentPage: 1 }
    this.alcaldesService.ListarAlcaldes(pagination)
      .subscribe( resp => {
        const alcalde = resp.data[0];
        dniControl?.setValue(alcalde?.dni || '');
        nombreControl?.setValue(alcalde?.nombre || '');
        telefonoControl?.setValue(alcalde?.telefono || '');
        cargoControl?.setValue(alcalde?.cargo || '');
        alcaldeAsistenteIdControl?.setValue(alcalde?.alcaldeId || '');
      })
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
    const pagination: Pagination = { sectorId, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.entidadesService.listarEntidades(pagination).subscribe( resp => this.entidadesSector.set(resp.data))
  }

  changeEntidadSector(index: number){
    const getControl = this.formMesa.get('sectores') as FormArray
    const sectorControl = getControl.at(index).get('sectorId')
    const entidadIdControl = getControl.at(index).get('entidadId')
    const sectorValue = sectorControl?.value

    if(sectorValue){
      entidadIdControl?.enable()
      this.obtenerEntidadSectorService(sectorValue, index)
    } else {
      entidadIdControl?.disable()
    }
  }

  obtenerEntidadSectorService(sectorId: number, index: number){
    const copyEntidades = [...this.listaEntidadesSector()]
    const pagination: Pagination = { sectorId, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.entidadesService.listarEntidades(pagination).subscribe( resp => {
      if(resp.success){
        copyEntidades[index] = resp.data
        this.listaEntidadesSector.set(copyEntidades)
      }
    })

  }

  changeDepartamento(index: number){
    const getControl = this.formMesa.get('ubigeos') as FormArray

    const departamentoControl = getControl.at(index).get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = getControl.at(index).get('provincia')
    const distritoControl = getControl.at(index).get('distrito')
    const entidadIdControl = getControl.at(index).get('entidadId')
    const autoridadControl = getControl.at(index).get('autoridad')
    const entidadControl = getControl.at(index).get('entidad')
    const entidadSlugControl = getControl.at(index).get('entidadSlug')

    let ubigeo = null 
    if(departamentoValue){
      ubigeo = `${departamentoValue}0000`
      this.obtenerProvinciaService(departamentoValue, index)
      this.obtenerEntidadUbigeoService(ubigeo, index)
      provinciaControl?.enable()
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
      entidadControl?.reset()
      entidadIdControl?.reset()
      entidadSlugControl?.reset()
      autoridadControl?.disable()
      autoridadControl?.reset()
    }
    this.validarAutoridad(index)
    // this.validarAutoridad(index)
    
    // getControl.at(index).get('ubigeo')?.setValue(ubigeo)
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
    this.obtenerEntidadUbigeoService(ubigeo, index)
    this.validarAutoridad(index)
    // getControl.at(index).get('ubigeo')?.setValue(ubigeo)
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
    this.obtenerEntidadUbigeoService(ubigeo, index)
    this.validarAutoridad(index)
    // getControl.at(index).get('ubigeo')?.setValue(ubigeo)
  }


  obtenerEntidadUbigeoService(ubigeo: string, index:number){
    const getControl = this.formMesa.get('ubigeos') as FormArray
    const autoridadControl = getControl.at(index).get('autoridad')
    const entidadControl = getControl.at(index).get('entidad')
    const entidadIdControl = getControl.at(index).get('entidadId')
    const entidadSlugControl = getControl.at(index).get('entidadSlug')
     const pagination: Pagination = { ubigeo, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.entidadesService.listarEntidades(pagination)
      .subscribe( resp => {
        const entidad = resp.data[0]        
        entidadControl?.setValue(entidad.nombre || '');
        entidadIdControl?.setValue(entidad.entidadId || '')
        entidadSlugControl?.setValue(`${entidad.entidadTipo} ${entidad.entidadSlug}` || '')
        autoridadControl?.enable()
      })
  }

  generalValidate(){
    // const nombreControl = this.formControlValidate('nombre')
    // const sectorControl = this.formControlValidate('sectorId')
    // const secreatriaTecnicaControl = this.formControlValidate('secretariaTecnicaId')
    // const fechaCreacionControl = this.formControlValidate('fechaCreacion')
    // const fechaVigenciaControl = this.formControlValidate('fechaVigencia')
    // const resolucionControl = this.formControlValidate('resolucion')
    // return nombreControl && sectorControl && secreatriaTecnicaControl && fechaCreacionControl && fechaVigenciaControl && resolucionControl;
    return true
  }

  sectorsValidate(){
    // const sectoresControl = this.formControlValidate('sectores')
    const sectores = this.formMesa.get('sectores') as FormArray
    // const levelControl = getControl.at(index).get(subcontrol)
    let sectoresControl = true;
    sectores.controls.forEach((grupo, index) => {
      const sectorId = grupo.get('sectorId');
      const entidadId = grupo.get('entidadId');
      if (!sectorId?.valid) {
        sectorId?.markAsTouched();
        sectoresControl = false;
      }
      if (!entidadId?.valid) {
        entidadId?.markAsTouched();
        sectoresControl = false;
      }
    });

    // sectorId: [null, Validators.required],
    //   entidadId: [ '', Validators.required],
    //   autoridad: [false, Validators.required],
    //   alcaldeAsistenteId: [ '' ],
    //   dni: ['', [Validators.required, Validators.pattern(this.validatorService.DNIPattern)]],
    //   nombre: ['', Validators.required],
    //   telefono: ['', Validators.required],
    //   entidad: ['', Validators.required],

    return sectoresControl
  }

  formControlValidate(controlName:string){
    const control = this.formMesa.get(controlName);
    let valid = true
    if(!control?.valid){
      control?.markAsTouched()
      valid = false
    }
    return valid
  }

  formValidate(){
    const valid = this.formMesa.valid
    if (!valid) {
      return this.formMesa.markAllAsTouched();
    }
    return valid
  }
}
