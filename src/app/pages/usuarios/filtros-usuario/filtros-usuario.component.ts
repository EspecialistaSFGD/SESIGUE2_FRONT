import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SectorResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { UbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-filtros-usuario',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PrimeNgModule, ReactiveFormsModule],
  templateUrl: './filtros-usuario.component.html',
  styles: ``
})
export class FiltrosUsuarioComponent {

  @Input() visible: boolean = false
  @Input() sectores: SectorResponse[] = []
  @Input() departamentos: UbigeoDepartmentResponse[] = []

  @Output() visibleDrawer = new EventEmitter<boolean>()

  tipos: string[] = ['sector', 'ubigeo']

  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private fb = inject(FormBuilder)
  private ubigeoService = inject(UbigeosService)

  formFilters: FormGroup = this.fb.group({
      tipo: [this.tipos[0]],
      documentoNumero: [''],
      perfil: [''],
      sectorId: [null],
      departamento: [null],
      provincia: [{ value: null, disabled: true }],
      distrito: [{ value: null, disabled: true }],
      ubigeo: ['']
    })

    changeCodigo(event: any){

    }

    changeTipo(){

    }

    changeSector(){

    }

    changeDepartamento(){
      const departamentoControl = this.formFilters.get('departamento')
      const departamentoValue = departamentoControl?.value
      const provinciaControl = this.formFilters.get('provincia')
      const distritoControl = this.formFilters.get('distrito')
      if(departamentoValue){
        provinciaControl?.enable()
        this.obtenerProvinciasService()
      } else {
        provinciaControl?.setValue(null)
        provinciaControl?.reset()
        provinciaControl?.disable()       
      }
      distritoControl?.setValue(null)
      distritoControl?.reset()
      distritoControl?.disable()
    }

    obtenerProvinciasService(){
      const departamentoControl = this.formFilters.get('departamento')
      const departamentoValue = departamentoControl?.value
      this.ubigeoService.getProvinces(departamentoValue)
        .subscribe(resp => {
          this.provincias.set(resp.data)
        })
    }

    changeProvincia(){
      const provinciaValue = this.formFilters.get('provincia')?.value
      const distritoControl = this.formFilters.get('distrito')
      if(provinciaValue){
        distritoControl?.enable()
        this.obtenerDistritosService()
      } else {
        distritoControl?.setValue(null)
        distritoControl?.reset()
        distritoControl?.disable()
      }
    }

    obtenerDistritosService(){
      const provinciaControl = this.formFilters.get('provincia')
      const provinciaValue = provinciaControl?.value.slice(0,4)
      this.ubigeoService.getDistricts(provinciaValue)
        .subscribe(resp => {
          this.distritos.set(resp.data)
        })
    }

    changeDistrito(){
      
    }

    changeExport(){
      this.visible = false
    }

    closeDrawer(){
      this.visible = false
      this.visibleDrawer.emit(this.visible)
    }
}
