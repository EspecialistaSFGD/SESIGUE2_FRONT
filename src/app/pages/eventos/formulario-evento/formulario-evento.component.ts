import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventoEstadoEnum } from '@core/enums';
import { convertDateStringToDate, convertEnumToObject, generarRangoFechas, typeErrorControl } from '@core/helpers';
import { DataModalEvento, EventoDiaResponse, EventoResponse, ItemEnum, Pagination, SubTipoResponse, TipoEventoResponse } from '@core/interfaces';
import { EventoDiasService, SubTipoService, TipoEventosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-evento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule],
  templateUrl: './formulario-evento.component.html',
  styles: ``
})
export class FormularioEventoComponent {

  readonly dataEvento: DataModalEvento = inject(NZ_MODAL_DATA);

  minDate: Date = new Date()
  nextCallback: boolean = false
  
  create: boolean = this.dataEvento.create
  evento = signal<EventoResponse>(this.dataEvento.evento)
  estados: ItemEnum[] = convertEnumToObject(EventoEstadoEnum)

  subTipos = signal<SubTipoResponse[]>([])
  tipoEventos = signal<TipoEventoResponse[]>([])
  eventoDias = signal<EventoDiaResponse[]>([])
  
  private fb = inject(FormBuilder)
  private subTiposService = inject(SubTipoService)
  private tipoEventosServices = inject(TipoEventosService)
  private eventoDiaService = inject(EventoDiasService)

  get diasevento(): FormArray {
    return this.formEvento.get('diasevento') as FormArray;
  }

  formEvento:FormGroup = this.fb.group({
    nombre: [null, Validators.required],
    abreviatura: [null, Validators.required],
    fechaEvento: [ null, Validators.required],
    fechaFinEvento: [ null, Validators.required ],
    vigente: [ EventoEstadoEnum.INICIADO, Validators.required ],
    subTipoId: [ null, Validators.required ],
    codigoTipoEvento: [ null, Validators.required ],
    verificaAsistentes: [ true, Validators.required ],
    primeraTarea: [ false, Validators.required ],
    cantidadSectores: [ 0, [Validators.required, Validators.min(0), Validators.max(18)] ],
    maximoPedidos: [ 0, [Validators.required, Validators.min(0), Validators.max(20)] ],
    diasevento: this.fb.array([]),
  })

  ngOnInit(): void {
    this.setMinDate()
   this.estados = this.estados.map(item => ({ ...item, text: item.value.toLowerCase() }))    
    if(!this.create){
      const evento = this.evento()
      const fechaEvento = evento.fechaEvento ? convertDateStringToDate(evento.fechaEvento!) : null
      const fechaFinEvento = evento.fechaFinEvento ? convertDateStringToDate(evento.fechaFinEvento!) : null
      this.formEvento.reset({...evento, fechaEvento, fechaFinEvento})
    }
    this.obtenerSubTiposService()
    this.obtenerServicioTipoEspacio()
  }

  setMinDate(){
    const hoy = this.create ? new Date() : convertDateStringToDate(this.evento().fechaEvento!);
    hoy.setHours(0, 0, 0, 0);
    this.minDate = hoy;
  }

  alertMessageError(control: string) {
    return this.formEvento.get(control)?.errors && this.formEvento.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formEvento.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  alertMessageErrorTwoNivel(control: string, index: number, subcontrol: string) {
    const getControl = this.formEvento.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    return levelControl?.errors && levelControl?.touched
  }

  msgErrorControlTwoNivel(control: string, index: number, subcontrol: string, label?: string): string {
    const getControl = this.formEvento.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    const text = label ? label : subcontrol
    const errors = levelControl?.errors;

    return typeErrorControl(text, errors)
  }

  generalValidate(): boolean {
    const nombreValue = this.formEvento.get('nombre')?.value
    const abreviaturaValue = this.formEvento.get('abreviatura')?.value
    const fechaEventoValue = this.formEvento.get('fechaEvento')?.value
    const fechaFinEventoValue = this.formEvento.get('fechaFinEvento')?.value
    const subTipoIdValue = this.formEvento.get('subTipoId')?.value
    const codigoTipoEventoValue = this.formEvento.get('codigoTipoEvento')?.value
    const cantidadSectoresValue = this.formEvento.get('cantidadSectores')?.value
    const maximoPedidosValue = this.formEvento.get('maximoPedidos')?.value

    return nombreValue && abreviaturaValue && fechaEventoValue && fechaFinEventoValue && subTipoIdValue && codigoTipoEventoValue && cantidadSectoresValue && maximoPedidosValue
  }

  validateCallback(event: Event): boolean {
    event.preventDefault()

    const validate = this.generalValidate()

    if(validate){
      this.generarFechasDias()
    }   
   
    return validate
  }


  generarFechasDias(){
    const fechaCreacionValue = this.formEvento.get('fechaEvento')?.value
    const fechaVigenciaValue = this.formEvento.get('fechaFinEvento')?.value

    const fechaCreacion = new Date(fechaCreacionValue);
    const fechaVigencia = new Date(fechaVigenciaValue);

    this.diasevento.clear();

    if(fechaCreacionValue && fechaVigenciaValue){
      let fechas:Date[] = generarRangoFechas(fechaCreacion, fechaVigencia)
      this.agregarFechasEvento(fechas);
    }
  }

  obtenerSubTiposService(){
    const pagination: Pagination = { columnSort: 'codigoSubTipo', typeSort: 'DESC', pageSize: 50, currentPage: 1 }
    const codigoValidos:string[] = ['R','P','D']
    this.subTiposService.ListarSubTipo(pagination).subscribe(resp => this.subTipos.set(resp.data.filter(item => codigoValidos.includes(item.codigo!))))
  }

  obtenerServicioTipoEspacio() {
    const pagination: Pagination = { columnSort: 'codigoTipoEvento', typeSort: 'DESC', pageSize: 50, currentPage: 1 }
    this.tipoEventosServices.getAllTipoEvento(pagination).subscribe(resp => this.tipoEventos.set(resp.data))
  }

  validateDate(control: string){
    const fechaEventoControl = this.formEvento.get('fechaEvento')
    const fechaCreacionValue = fechaEventoControl?.value
    const fechaFinEventoControl = this.formEvento.get('fechaFinEvento')
    const fechaVigenciaValue = fechaFinEventoControl?.value

    const fechaCreacion = new Date(fechaCreacionValue);
    const fechaVigencia = new Date(fechaVigenciaValue);

    if(control == 'fechaEvento'){
      if (fechaCreacionValue && fechaVigenciaValue && fechaCreacion > fechaVigencia) {
        fechaEventoControl?.setErrors({ ...fechaEventoControl.errors, msgBack: 'La fecha de inicio debe ser menor o igual que la fecha de fin.' });
      } else {
        fechaFinEventoControl?.setErrors(null)
      }
    } else if(control == 'fechaFinEvento'){
      if (fechaCreacionValue && fechaVigenciaValue && fechaVigencia < fechaCreacion) {
        fechaFinEventoControl?.setErrors({ ...fechaFinEventoControl.errors, msgBack: 'La fecha de fin debe ser mayor que la fecha de inicio.' });
      } else {
        fechaEventoControl?.setErrors(null)
      }
    }
  }

  agregarFechasEvento(fechas:Date[]){
    if(this.create){
      for (let fecha of fechas) {
        const diaEvento = this.fb.group({
          fecha: [fecha, Validators.required],
          plenaria: [false, Validators.required],
          cantidadSector: [0, [Validators.required, Validators.min(0), Validators.max(30)]],
          cantidadRegionalLocal: [0, [Validators.required, Validators.min(0), Validators.max(30)]],
        })
        this.diasevento.push(diaEvento)            
      }
    } else {
      this.obtenerEventoDiasService()
    }
    
  }

  obtenerEventoDiasService(){
    const paginationEventoDia: Pagination = {
    columnSort: 'diaEventoId',
    typeSort: 'asc',
    currentPage: 1,
    pageSize: 10,
    eventoId: this.evento().eventoId?.toString()
  }
  this.eventoDiaService.ListarEventoDias(paginationEventoDia)
    .subscribe( resp => {
      for(let data of resp.data){          
        const diaEvento = this.fb.group({
          fecha: [data.fecha ],
          plenaria: [data.plenaria ],
          cantidadSector: [data.cantidadSector],
          cantidadRegionalLocal: [data.cantidadRegionalLocal],
        })
        this.diasevento.push(diaEvento)         
      }
    })
  }

  obtenerControlValue(control: string, index: number, subcontrol: string){
    const getControl = this.formEvento.get(control) as FormArray
    return getControl.at(index).get(subcontrol)
  }
}
