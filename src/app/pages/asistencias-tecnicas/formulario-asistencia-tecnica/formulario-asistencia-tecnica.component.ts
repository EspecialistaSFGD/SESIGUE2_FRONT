import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsistenciasTecnicasClasificacion, AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos } from '@interfaces/asistencia-tecnica.interface';
import { LugarResponse } from '@interfaces/lugar.interface';
import { UbigeoEntidad } from '@interfaces/ubigeo.interface';
import { AuthService } from '@services/auth/auth.service';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-formulario-asistencia-tecnica',
  standalone: true,
  templateUrl: './formulario-asistencia-tecnica.component.html',
  styles: ``,
  imports: [
    CommonModule,
    NzModalModule,
    ReactiveFormsModule,
    NzFormModule,
    NzRadioModule,
    NzInputModule,
    NzDatePickerModule,
    NzSelectModule,
    NzIconModule,
    NzUploadModule,
    NzCollapseModule,
    NzSpaceModule,
    NzInputNumberModule
  ]
})
export class FormularioAsistenciaTecnicaComponent {
  @Input() showModal: boolean = false
  @Output() setCloseShow = new EventEmitter()

  tipos: AsistenciasTecnicasTipos[] = Object.values(AsistenciasTecnicasTipos)
  modalidades: AsistenciasTecnicasModalidad[] = Object.values(AsistenciasTecnicasModalidad)
  clasificaciones: AsistenciasTecnicasClasificacion[] = Object.values(AsistenciasTecnicasClasificacion)
  lugares: LugarResponse[] = [
    { lugarId: '1', nombre: 'PCM - Palacio' },
    { lugarId: '2', nombre: 'PCM - Schell' },
  ]
  entidades: LugarResponse[] = [
    { lugarId: '1', nombre: 'Gobierno Nacional' },
    { lugarId: '2', nombre: 'Gobierno Regional' },
    { lugarId: '3', nombre: 'Gobierno Local' },
  ]
  tipoParticipantes: LugarResponse[] = [
    { lugarId: '1', nombre: 'Tipo 1' },
    { lugarId: '2', nombre: 'Tipo 3' },
    { lugarId: '3', nombre: 'Tipo 3' },
  ]
  clasificacion: LugarResponse[] = [
    { lugarId: '1', nombre: 'clasificacion 1' },
    { lugarId: '2', nombre: 'clasificacion 3' },
    { lugarId: '3', nombre: 'clasificacion 3' },
  ]
  participar: string[] = ['si', 'no']
  fileList: NzUploadFile[] = [];

  ubigeoEntidad: UbigeoEntidad = {
    id: 0,
    department: 0,
    province: 0,
    district: 0
  }

  listParticipantes: Array<{ id: number; controlInstance: string }> = [{ id: 1, controlInstance: 'text' }];

  private fb = inject(FormBuilder)
  private authService = inject(AuthService)

  get participantes() {
    return this.formAsistencia.get('participantes') as FormArray;
  }

  get agendas() {
    return this.formAsistencia.get('agendas') as FormArray;
  }



  public formAsistencia: FormGroup = this.fb.group({
    tipo: ['', Validators.required],
    modalidad: ['', Validators.required],
    fechaAtencion: ['', Validators.required],
    lugarId: ['', Validators.required],
    tipoEntidadId: ['', Validators.required],
    entidadId: ['', Validators.required],
    departamento: ['', Validators.required],
    provincia: ['', Validators.required],
    distrito: ['', Validators.required],
    entidad: [{ value: '', disabled: true }],
    autoridad: ['', Validators.required],
    dniAutoridad: ['', Validators.required],
    nombreAutoridad: ['', Validators.required],
    cargoAutoridad: ['', Validators.required],
    congresista: ['', Validators.required],
    dniCongresista: ['', Validators.required],
    nombreCongresista: ['', Validators.required],
    cargoCongresista: [{ value: 'Congresista', disabled: true }],
    espacioId: ['', Validators.required],
    clasificacion: ['', Validators.required],
    tema: ['', Validators.required],
    comentarios: ['', Validators.required],
    evidenciaReunion: ['', Validators.required],
    evidenciaAsistencia: ['', Validators.required],
    participantes: this.fb.array([]),
    agendas: this.fb.array([])
  })

  addItemFormArray(event: MouseEvent, formGroup: string) {
    event.preventDefault();
    event.stopPropagation();
    if (formGroup == 'participantes') {
      const participanteRow = this.fb.group({
        participanteId: ['', Validators.required],
        cantidad: ['', Validators.required],
      })
      this.participantes.push(participanteRow)
    }
    if (formGroup == 'agendas') {
      const agendaRow = this.fb.group({
        clasificacionId: ['', Validators.required],
        cui: ['', Validators.required],
      })
      this.agendas.push(agendaRow)
    }
    console.log(formGroup);

  }
  removeItemFormArray(i: number, formGroup: string) {
    if (formGroup == 'participantes') {
      this.participantes.removeAt(i)
    } else if (formGroup == 'agendas') {
      this.agendas.removeAt(i)
    }
  }

  ngOnInit() {
    this.obtenerUbigeo()
  }

  obtenerUbigeo() {
    console.log('UBIGEO');
    const departments = (this.authService.departamento()) ? this.authService.departamento() : this.ubigeoEntidad.department;
    console.log(this.authService.departamento());
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  submitFormulario() {
    console.log(this.formAsistencia.value);

  }

  saveOrEdit() {
    console.log('save or edit');

  }
  closeModal() {
    this.showModal = false
    this.setCloseShow.emit(false)
  }
}
