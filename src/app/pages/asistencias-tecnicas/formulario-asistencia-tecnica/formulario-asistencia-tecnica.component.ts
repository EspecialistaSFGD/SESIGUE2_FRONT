import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsistenciasTecnicasClasificacion, AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos } from '@interfaces/asistencia-tecnica.interface';
import { LugarResponse } from '@interfaces/lugar.interface';
import { UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoEntidad, UbigeoProvinciaResponse } from '@interfaces/ubigeo.interface';
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
import { ItemEnum } from '@interfaces/helpers.interface';
import { UbigeosService } from '@services/ubigeos.service';
import { LugaresService } from '@services/lugares.service';
import { TipoEntidadesService } from '@services/tipo-entidades.service';
import { EspaciosService } from '@services/espacios.service';
import { NivelGobiernosService } from '@services/nivel-gobiernos.service';
import { ClasificacionesService } from '@services/clasificaciones.service';
import { AsistenciasTecnicasService } from '@services/asistencias-tecnicas.service';

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
  @Input() tipos!: ItemEnum[]
  @Input() modalidades!: ItemEnum[]
  @Input() clasificaciones!: ItemEnum[]
  @Input() departamentos!: UbigeoDepartmentResponse[]
  @Output() setCloseShow = new EventEmitter()
  @Output() addFormDate = new EventEmitter()

  public provincias = signal<UbigeoProvinciaResponse[]>([])
  public distritos = signal<UbigeoDistritoResponse[]>([])
  provinceDisabled: boolean = true
  districtDisabled: boolean = true

  lugares: LugarResponse[] = [
    { lugarId: '1', nombre: 'PCM - Palacio' },
    { lugarId: '2', nombre: 'PCM - Schell' },
    { lugarId: '3', nombre: 'Sector' },
    { lugarId: '4', nombre: 'Territorio' },
  ]
  entidades: LugarResponse[] = [
    { lugarId: '1', nombre: 'Gobierno Regional' },
    { lugarId: '2', nombre: 'Mancomunidad Regiona' },
    { lugarId: '3', nombre: 'Mancomunidad Municipal' },
  ]
  tipoParticipantes: LugarResponse[] = [
    { lugarId: '1', nombre: 'Gobierno Nacional' },
    { lugarId: '2', nombre: 'Gobierno Regional' },
    { lugarId: '3', nombre: 'Gobierno Local' },
  ]
  clasificacion: LugarResponse[] = [
    { lugarId: '1', nombre: 'Destrabe' },
    { lugarId: '2', nombre: 'Gestión de financiamiento' },
    { lugarId: '3', nombre: 'Seguimiento y monitoreo' },
  ]
  espacios: LugarResponse[] = [
    { lugarId: '1', nombre: 'Mancomunidades' },
    { lugarId: '2', nombre: 'Mesa de dialogo' },
    { lugarId: '3', nombre: 'Consejo de estado regional' },
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
  private asistenciaTecnicaService = inject(AsistenciasTecnicasService)
  private ubigeoService = inject(UbigeosService)
  private lugarService = inject(LugaresService)
  private tipoEntidad = inject(TipoEntidadesService)
  private espacioService = inject(EspaciosService)
  private nivelGobiernoService = inject(NivelGobiernosService)
  private clasificacionService = inject(ClasificacionesService)

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
    entidadId: ['1', Validators.required],
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

  ngOnInit() {
    this.obtenerLugares()
  }

  obtenerLugares() {
    console.log('lugares');
    this.lugarService
  }

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

  obtenerUbigeo(value: string, ubigeo: string) {
    if (ubigeo == 'provincias') {
      this.formAsistencia.get('provincia')?.reset();
      this.formAsistencia.get('distrito')?.reset();
      this.districtDisabled = true
      this.ubigeoService.getProvinces(value)
        .subscribe(resp => {
          if (resp.success == true) {
            this.provinceDisabled = false
            this.provincias.set(resp.data)
          }
        })
    } else if (ubigeo == 'distritos') {
      this.formAsistencia.get('distrito')?.reset();
      this.ubigeoService.getDistricts(value)
        .subscribe(resp => {
          if (resp.success == true) {
            this.districtDisabled = false
            this.distritos.set(resp.data)
          }
        })
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };


  saveOrEdit() {
    if (this.formAsistencia.invalid) {
      this.formAsistencia.markAllAsTouched()
    }
    const dateForm = new Date(this.formAsistencia.get('fechaAtencion')?.value)
    const getMonth = dateForm.getMonth() + 1
    const getDay = dateForm.getDate()
    const month = getMonth > 9 ? getMonth : `0${getMonth}`
    const day = getDay > 9 ? getDay : `0${getDay}`
    const fechaAtencion = `${day}/${month}/${dateForm.getFullYear()}`
    this.asistenciaTecnicaService.registrarAsistenciaTecnica({ ... this.formAsistencia.value, fechaAtencion })
      .subscribe(resp => {
        if (resp == true) {
          this.addFormDate.emit(true)
          this.showModal = false
          this.formAsistencia.reset()
        }
      })
  }
  closeModal() {
    this.showModal = false
    this.setCloseShow.emit(false)
  }
}
