import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataModalInversionTarea } from '@core/interfaces';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-inversion-tarea',
  standalone: true,
  imports: [],
  templateUrl: './formulario-inversion-tarea.component.html',
  styles: ``
})
export class FormularioInversionTareaComponent {
  readonly dataInversionTarea: DataModalInversionTarea = inject(NZ_MODAL_DATA);

  private fb = Inject(FormBuilder)

  formInversionTarea: FormGroup = this.fb.group({
    tarea: [ '', Validators.required ],
    plazo: [ '', Validators.required ],
    sector: [ '', Validators.required ],
    entidadId: [ '', Validators.required ],
    responsableId: [ '', Validators.required ]
  })
}
