import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { DataFile } from '@core/interfaces';
import { BotonUploadComponent } from '@shared/boton/boton-upload/boton-upload.component';
import { BotonComponent } from '@shared/boton/boton/boton.component';

@Component({
  selector: 'app-formulario-desarrollo-actividad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BotonComponent, BotonUploadComponent],
  templateUrl: './formulario-desarrollo-actividad.component.html',
  styles: ``
})
export class FormularioDesarrolloActividadComponent {
  private fb = inject(FormBuilder)

  get adjuntos(): FormArray {
    return this.formDesarolloActividad.get('adjuntos') as FormArray;
  }

  formDesarolloActividad: FormGroup = this.fb.group({
    descripcion: [null, Validators.required],
    adjuntos: this.fb.array([]),
  })

  ngOnInit(): void {
    this.addAdjuntoRow()
  }

  alertMessageError(control: string) {
    return this.formDesarolloActividad.get(control)?.errors && this.formDesarolloActividad.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formDesarolloActividad.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  alertMessageErrorTwoNivel(control: string, index: number, subcontrol: string) {
    const getControl = this.formDesarolloActividad.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    return levelControl?.errors && levelControl?.touched
  }

  msgErrorControlTwoNivel(control: string, index: number, subcontrol: string, label?: string): string {
    const getControl = this.formDesarolloActividad.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    const text = label ? label : subcontrol
    const errors = levelControl?.errors;

    return typeErrorControl(text, errors)
  }

  addItemFormArray(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.addAdjuntoRow();
  }

  addAdjuntoRow() {    
    const adjuntoRow = this.fb.group({
      adjuntoId: [],
      archivo: [null, Validators.required],
    })
    this.adjuntos.push(adjuntoRow)
  }

  removeItemFormArray(i: number) {
    this.adjuntos.removeAt(i)
  }

  changeFiles(dataFile: DataFile, i: number) {
    const adjuntos = this.formDesarolloActividad.get('adjuntos') as FormArray
    const controlArchivo = adjuntos.at(i).get('archivo')
      if (dataFile.exist) {
        controlArchivo?.setValue(dataFile.file!)
  
        const reader = new FileReader()
        reader.readAsDataURL(dataFile.file!)
      } else {
        controlArchivo?.reset()
      }
    }
}
