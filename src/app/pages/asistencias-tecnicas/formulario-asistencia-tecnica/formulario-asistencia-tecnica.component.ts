import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
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
import { Pagination } from '@interfaces/pagination.interface';
import { LugaresService } from '@services/lugares.service';
import { EntidadesService } from '@services/entidades.service';
import { EspaciosService } from '@services/espacios.service';
import { NivelesGobiernosService } from '@services/niveles-gobiernos.service';
import { ClasificacionesService } from '@services/clasificaciones.service';
import { TipoEntidadResponse } from '@interfaces/entidad.interface';
import { EspacioResponse } from '@interfaces/espacios.interfaces';
import { NivelGobiernoResponse } from '@interfaces/nivel-gobierno.interface';
import { ClasificacionResponse } from '@interfaces/clasificaciones.interface';

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
  public lugares = signal<LugarResponse[]>([])
  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  public espacios = signal<EspacioResponse[]>([])
  public participantesGobiernos = signal<NivelGobiernoResponse[]>([])
  public agendasClasificaciones = signal<ClasificacionResponse[]>([])

  allPagination: Pagination = {
    code: 0,
    columnSort: 'fechaAtencion',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }
  // entidades: LugarResponse[] = [
  //   { lugarId: '1', nombre: 'Gobierno Nacional' },
  //   { lugarId: '2', nombre: 'Gobierno Regional' },
  //   { lugarId: '3', nombre: 'Gobierno Local' },
  // ]
  // tipoParticipantes: LugarResponse[] = [
  //   { lugarId: '1', nombre: 'Tipo 1' },
  //   { lugarId: '2', nombre: 'Tipo 3' },
  //   { lugarId: '3', nombre: 'Tipo 3' },
  // ]
  // clasificacion: LugarResponse[] = [
  //   { lugarId: '1', nombre: 'clasificacion 1' },
  //   { lugarId: '2', nombre: 'clasificacion 3' },
  //   { lugarId: '3', nombre: 'clasificacion 3' },
  // ]
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
  private lugaresService = inject(LugaresService)
  private tipoEntidadService = inject(EntidadesService)
  private espacioService = inject(EspaciosService)
  private nivelGobiernosService = inject(NivelesGobiernosService)
  private clasificacionesService = inject(ClasificacionesService)

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
    tipoEntidadId: ['1', Validators.required],
    entidadId: ['1', Validators.required],
    departamento: ['', Validators.required],
    provincia: ['', Validators.required],
    distrito: ['', Validators.required],
    entidad: [{ value: '', disabled: true }],
    autoridad: ['', Validators.required],
    dniAutoridad: [''],
    nombreAutoridad: [''],
    cargoAutoridad: [''],
    congresista: ['', Validators.required],
    dniCongresista: [''],
    nombreCongresista: [''],
    cargoCongresista: [{ value: 'Congresista', disabled: true }],
    espacioId: ['', Validators.required],
    clasificacion: ['', Validators.required],
    tema: ['', Validators.required],
    comentarios: ['', Validators.required],
    evidenciaReunion: ['' ],
    evidenciaAsistencia: ['' ],
    participantes: this.fb.array([]),
    agendas: this.fb.array([])
  })


  ngOnInit() {
    this.obtenerUbigeo()
    this.obtenerLugares()
    this.obtenerTipoEntidad()
    this.obtenerEspacios()
    this.obtenerParticipantes()
    this.obtenerClasificaciones()
  }

  obtenerUbigeo() {
    const departments = (this.authService.departamento()) ? this.authService.departamento() : this.ubigeoEntidad.department;
    // console.log(this.authService.departamento());
  }

  obtenerLugares(){
    this.allPagination.columnSort = 'lugarId'
    this.lugaresService.getAllLugares(this.allPagination)
      .subscribe(resp => {
        if(resp.success == true){          
          this.lugares.set(resp.data)
        }      
      })
  }

  obtenerTipoEntidad(){
    this.allPagination.columnSort = 'nombre'
    this.tipoEntidadService.getAllTipoEntidades(this.allPagination)
    .subscribe(resp => {
      if(resp.success == true){   
        this.tipoEntidades.set(resp.data)
      }      
    })
  }

  obtenerEspacios(){
    this.allPagination.columnSort = 'nombre'
    this.espacioService.getAllEspacios(this.allPagination)
    .subscribe(resp => {
      if(resp.success == true){
        this.espacios.set(resp.data)
      }      
    })
  }

  obtenerParticipantes(){
    this.allPagination.columnSort = 'nombre'
    this.nivelGobiernosService.getAllNivelesGobiernos(this.allPagination)
    .subscribe(resp => {
      if(resp.success == true){ 
        this.participantesGobiernos.set(resp.data)      }      
    })
  }

  obtenerClasificaciones(){
    this.allPagination.columnSort = 'nombre'
    this.clasificacionesService.getAllClasificaciones(this.allPagination)
    .subscribe(resp => {
      if(resp.success == true){      
        this.agendasClasificaciones.set(resp.data)      }      
    })
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
  }
  removeItemFormArray(i: number, formGroup: string) {
    if (formGroup == 'participantes') {
      this.participantes.removeAt(i)
    } else if (formGroup == 'agendas') {
      this.agendas.removeAt(i)
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  submitFormulario() {
    // console.log(this.formAsistencia.value);
  }

  saveOrEdit() {    
    if (this.formAsistencia.invalid){
      this.formAsistencia.markAllAsTouched()
      return;
    }
    console.log(this.formAsistencia.value);

  }
  closeModal() {
    this.showModal = false
    this.setCloseShow.emit(false)
  }
}
