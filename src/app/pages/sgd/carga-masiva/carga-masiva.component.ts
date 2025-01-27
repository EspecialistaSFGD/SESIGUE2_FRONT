import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { CargasMasivasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [
    CommonModule,
    NgZorroModule,
    ReactiveFormsModule
  ],
  templateUrl: './carga-masiva.component.html',
  styles: ``
})
export default class CargaMasivaComponent {
  title: string = 'Carga masiva - SGD'
  @Input() showModal!: boolean

  @Output() setCloseShow = new EventEmitter()
  @Output() addFormDate = new EventEmitter()

  loading: boolean = false
  fileListMeet: NzUploadFile[] = [];
  fileListAttendance: NzUploadFile[] = [];
  fileMeet: File | null = null;
  fileAttendance: File | null = null;
  errors:string[] = []

  private fb = inject(FormBuilder)
  private cargaMasivaService = inject(CargasMasivasService)

  formCargaMasiva: FormGroup = this.fb.group({
    tabla: ['atencion', Validators.required],
    archivo: ['', Validators.required]
  })

  alertMessageError(control: string) {
    return this.formCargaMasiva.get(control)?.errors && this.formCargaMasiva.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formCargaMasiva.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  beforeUploadMeet = (file: NzUploadFile): boolean => {
    const evidenciaReunion = this.formCargaMasiva.get('archivo')
    evidenciaReunion?.setValue(file)
    this.fileListMeet = []
    this.fileListMeet = this.fileListMeet.concat(file);
    return false;
  };

  uploadBulkUpload() {
    if (this.formCargaMasiva.invalid) {
      return this.formCargaMasiva.markAllAsTouched()
    }
    this.loading = true
    this.errors = []
    
    this.cargaMasivaService.subirCargaMasiva(this.formCargaMasiva.value)
      .subscribe(resp => {         
        this.loading = false
        this.formCargaMasiva.get('archivo')?.reset()
        if(resp.success) {
          this.addFormDate.emit(true)
          this.closeModal()
        } else {
          this.errors.push(resp.message)
        }
      })
  }

  closeModal() {
    this.showModal = false
    this.setCloseShow.emit(false)
  }
}
