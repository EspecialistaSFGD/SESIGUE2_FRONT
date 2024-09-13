import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';

@Component({
  selector: 'app-reporte-descarga',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    ReactiveFormsModule,
    NzGridModule,
    NzRadioModule,
  ],
  templateUrl: './reporte-descarga.component.html',
  styles: ``
})
export class ReporteDescargaComponent {
  reporteDescargaForm!: UntypedFormGroup;
  // readonly nzModalData: boolean = inject(NZ_MODAL_DATA);

  private fb = inject(UntypedFormBuilder);

  constructor() {
    this.crearReporteDescargaForm();
  }

  crearReporteDescargaForm(): void {
    this.reporteDescargaForm = this.fb.group({

      esDescargaTotal: [false, [Validators.required]]

    });
  }
}
