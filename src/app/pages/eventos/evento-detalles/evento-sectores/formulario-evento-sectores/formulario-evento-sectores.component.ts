import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { UbigeosService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-formulario-evento-sectores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './formulario-evento-sectores.component.html',
  styles: ``
})
export class FormularioEventoSectoresComponent {

  private ubigeoService = inject(UbigeosService)
  private fb = inject(FormBuilder)

  get departamentos(): FormArray {
    return this.formEventoSectores.get('departamentos') as FormArray;
  }

  formEventoSectores:FormGroup = this.fb.group({
    todos: [false, Validators.required],
    departamentos: this.fb.array([]),
  })

  ngOnInit(): void {
    this.obtenerDepartamentos()
  }

  obtenerDepartamentos(){
    this.ubigeoService.getDepartments().subscribe( resp => {
      for (let departamento of resp.data) {
        const departamentoItem = this.fb.group({
          departamentoId: [departamento.departamentoId, Validators.required],
          departamento: [departamento.departamento, Validators.required],
          seleccionado: [false, Validators.required],
        })
        this.departamentos.push(departamentoItem)
      }
    })
  }

  alertMessageErrorTwoNivel(control: string, index: number, subcontrol: string) {
    const getControl = this.formEventoSectores.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    return levelControl?.errors && levelControl?.touched
  }

  msgErrorControlTwoNivel(control: string, index: number, subcontrol: string, label?: string): string {
    const getControl = this.formEventoSectores.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    const text = label ? label : subcontrol
    const errors = levelControl?.errors;

    return typeErrorControl(text, errors)
  }
}
