import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsistenciasTecnicasClasificacion, AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos, AsistenciaTecnicaResponse } from '@interfaces/asistencia-tecnica.interface';
import { LugarResponse } from '@interfaces/lugar.interface';
import { typeErrorControl } from '@helpers/form';
import { ClasificacionResponse } from '@interfaces/clasificaciones.interface';
import { TipoEntidadResponse } from '@interfaces/entidad.interface';
import { EspacioResponse } from '@interfaces/espacios.interfaces';
import { ItemEnums } from '@interfaces/helpers.interface';
import { NivelGobiernoResponse } from '@interfaces/nivel-gobierno.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { UbigeoDepartamentoResponse } from '@interfaces/ubigeo.interface';
import { AsistenciasTecnicasService } from '@services/asistencias-tecnicas.service';
import { AuthService } from '@services/auth/auth.service';
import { ClasificacionesService } from '@services/clasificaciones.service';
import { EntidadesService } from '@services/entidades.service';
import { EspaciosService } from '@services/espacios.service';
import { LugaresService } from '@services/lugares.service';
import { NivelesGobiernosService } from '@services/niveles-gobiernos.service';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
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
  @Input() departamentos: UbigeoDepartamentoResponse[] = []
  @Output() setCloseShow = new EventEmitter()
  @Output() saveData = new EventEmitter()

  tipos:ItemEnums[] = Object.entries(AsistenciasTecnicasTipos).map(([value, text]) => ({ value: value.toLowerCase(), text }));
  modalidades:ItemEnums[] = Object.entries(AsistenciasTecnicasModalidad).map(([value, text]) => ({ value: value.toLowerCase(), text }));
  clasificaciones:ItemEnums[] = Object.entries(AsistenciasTecnicasClasificacion).map(([value, text]) => ({ value: value.toLowerCase(), text }));
  public lugares = signal<LugarResponse[]>([])
  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  public espacios = signal<EspacioResponse[]>([])
  public participantesGobiernos = signal<NivelGobiernoResponse[]>([])
  public agendasClasificaciones = signal<ClasificacionResponse[]>([])

  allPagination: Pagination = {
    code: 0,
    columnSort: 'fechaRegistro',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  participar: ItemEnums[] = [{ value: 'true', text: 'si' }, { value: 'false', text: 'no' }]
  fileList: NzUploadFile[] = [];

  private fb = inject(FormBuilder)
  private authService = inject(AuthService)
  private asistenciaTecnicaService = inject(AsistenciasTecnicasService)
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

  alertMessageError( control:string ){
    return this.formAsistencia.get( control )?.errors && this.formAsistencia.get( control )?.touched
  }

  msgErrorControl( control:string, label?:string ):string {
    const text = label ? label : control
    const errors = this.formAsistencia.get( control )?.errors;
    return typeErrorControl( text,errors )
  }


  ngOnInit() {    
    this.obtenerLugares()
    this.obtenerTipoEntidad()
    this.obtenerEspacios()
    this.obtenerParticipantes()
    this.obtenerClasificaciones()
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

  saveOrEdit() {    
    if (this.formAsistencia.invalid){
      this.formAsistencia.markAllAsTouched()
      return;
    }
    const fechaAtencionReg = this.formAsistencia.get('fechaAtencion')?.value;
    const getMonth = fechaAtencionReg.getMonth() + 1 
    const getDay = fechaAtencionReg.getDate()
    const month = getMonth > 9 ? getMonth : `0${getMonth}`
    const day = getDay > 9 ? getDay : `0${getDay}`
    const fechaAtencion = `${day}/${month}/${ fechaAtencionReg.getFullYear() }`
    const asistenciaTecnica: AsistenciaTecnicaResponse = { ...this.formAsistencia.value, fechaAtencion, code: this.authService.getCodigoUsuario() }
    this.asistenciaTecnicaService.registrarAsistenciaTecnica(asistenciaTecnica)
      .subscribe( resp => {
        if(resp === true){
          this.saveData.emit(true)
          this.closeModal()
        }
      })

  }
  closeModal() {
    this.showModal = false
    this.setCloseShow.emit(false)
  }
}
