import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { BotonResponse, Pagination } from '@core/interfaces';
import { BotonesService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-formulario-acceso-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './formulario-acceso-detalle.component.html',
  styles: ``
})
export class FormularioAccesoDetalleComponent {
  botones = signal<BotonResponse[]>([])
  
  private fb = inject(FormBuilder)
  private botonService = inject(BotonesService)

  formBoton:FormGroup = this.fb.group({
    botonId: ['', Validators.required]
  })

  ngOnInit(): void {
    this.obtenerBotonesService()
  }

  alertMessageError(control: string) {
    return this.formBoton.get(control)?.errors && this.formBoton.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formBoton.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  obtenerBotonesService(){
    const pagination: Pagination = { columnSort: 'codigoBoton', typeSort: 'ASC',  pageSize: 50, currentPage: 1 }
    this.botonService.listarBotones(pagination).subscribe( resp => this.botones.set(resp.data))
  }
}
