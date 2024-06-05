import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/response.model';
import { StepModel } from '../../models/step.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, delay, finalize, map, merge, scan, timer } from 'rxjs';
import { NzStatusType } from 'ng-zorro-antd/steps';
import { RequerimientoModel } from '../../models/requerimiento';

interface State {
  requerimientos: RequerimientoModel[];
  requerimientoSeleccionado: RequerimientoModel | null | undefined;
  //idRequerimientoSeleccionado: string | null | undefined;
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  total: number;
  sortField: string | null;
  sortOrder: string | null;
  idTipo: number;
  idEstado: number;
  //fecBusqueda: Date[] | null;
  nomRegistro: string;
}

interface ReqStep {
  steps: StepModel[];
  current: number;
  status: NzStatusType;
}

function mockAsyncStep(): Observable<number> {
  const subStep1 = timer(300).pipe(map(() => 25));
  const subStep2 = subStep1.pipe(delay(300));
  const subStep3 = subStep2.pipe(delay(300));
  const subStep4 = subStep3.pipe(delay(300));
  return merge(subStep1, subStep2, subStep3, subStep4).pipe(scan((a, b) => a + b));
}

@Injectable({
  providedIn: 'root'
})
export class RequerimientosService {

  public msg = inject(NzMessageService);
  public http = inject(HttpClient);
  private router = inject(Router);

  #requerimientos = signal<State>({
    requerimientos: [],
    requerimientoSeleccionado: null,
    //idRequerimientoSeleccionado: null,
    isLoading: true,
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    sortField: null,
    sortOrder: null,
    idTipo: 0,
    idEstado: 0,
    //fecBusqueda: null,
    nomRegistro: ''
  });

  public requerimientos = computed(() => this.#requerimientos().requerimientos);
  public requerimientoSeleccionado = computed(() => this.#requerimientos().requerimientoSeleccionado);
  //public idRequerimientoSeleccionado = computed(() => this.#requerimientos().idRequerimientoSeleccionado);
  public isLoading = computed(() => this.#requerimientos().isLoading);
  public pageIndex = computed(() => this.#requerimientos().pageIndex);
  public pageSize = computed(() => this.#requerimientos().pageSize);
  public total = computed(() => this.#requerimientos().total);
  public sortField = computed(() => this.#requerimientos().sortField);
  public sortOrder = computed(() => this.#requerimientos().sortOrder);
  public idTipo = computed(() => this.#requerimientos().idTipo);
  public idEstado = computed(() => this.#requerimientos().idEstado);
  //public fecBusqueda = computed(() => this.#requerimientos().fecBusqueda);
  public nomRegistro = computed(() => this.#requerimientos().nomRegistro);

  #requermientosSteps = signal<ReqStep>(
    {
      steps: [
        // new StepModel(0, 'Datos preliminares', 'Datos preliminares', 'wait'),
        new StepModel(0, 'Datos generales', 'Datos generales', 'wait', false, 0),
        new StepModel(1, 'Descripción', 'Descripción', 'wait', false, 0),
        new StepModel(2, 'Entregables', 'Entregables', 'wait', false, 0),
        new StepModel(3, 'Datos finales', 'Datos finales', 'wait', false, 0),
      ],
      current: 3,
      status: 'process',
    }
  );

  public steps = computed(() => this.#requermientosSteps().steps);
  public currentStep = computed(() => this.#requermientosSteps().current);
  public statusSteps = computed(() => this.#requermientosSteps().status);

  constructor() { }

  setIdRequermientoSeleccionado(id: string | null | undefined): void {
    this.#requerimientos.update((v) => ({ ...v, idRequerimientoSeleccionado: id }));
  }

  setRequermientoSeleccionado(id: string | null | undefined): void {

    if (id == null || id == undefined) {
      this.#requerimientos.update((v) => ({ ...v, requerimientoSeleccionado: null }));

      return;
    }

    let req = this.#requerimientos().requerimientos.find((x) => x.idRequerimiento == id);

    if (req != null && req != undefined)
      this.#requerimientos.update((v) => ({ ...v, requerimientoSeleccionado: req }));
    else
      this.#requerimientos.update((v) => ({ ...v, requerimientoSeleccionado: null }));
  }

  setNextStep(status: NzStatusType): void {

    if (this.currentStep() < this.steps().length) {
      const step = this.steps()[this.currentStep()];

      mockAsyncStep()
        .pipe(
          finalize(() => {
            step.percentage = 0;
          })
        )
        .subscribe({
          next: (p) => {
            step.percentage = p;
          },
          complete: () => {
            this.#requermientosSteps.update((v) => ({ ...v, status: status }));
          },
        });
    }
  }

  setPrevStep(): void {
    if (this.currentStep() > 0) {
      this.#requermientosSteps.update((v) => ({ ...v, current: this.currentStep() - 1 }));
    }
  }

  listarRequerimientos(idTipo: number = 0, idEstado: number = 0, nomRegistro: string = '', pageIndex: number = 1, pageSize: number = 10, sortField: string | null = null, sortOrder: string | null = null): void {
    this.#requerimientos.update((v) => ({ ...v, isLoading: true, pageIndex, pageSize, sortField, sortOrder, idTipo, idEstado, nomRegistro }));

    let params = new HttpParams();

    params = params.append('page', `${pageIndex}`);
    params = params.append('results', `${pageSize}`)
    params = params.append('sortField', `${sortField}`)
    params = params.append('sortOrder', `${sortOrder}`);

    if (idTipo != null) params = params.append('idTipo', `${idTipo}`);
    if (idEstado != null) params = params.append('idEstado', `${idEstado}`);
    if (nomRegistro != null) params = params.append('nomRegistro', `${nomRegistro}`);
    //if (fecBusqueda != null && fecBusqueda.length != 0) params = params.append('fecBusqueda', `${fecBusqueda}`);


    // console.log(this.#requerimientos());


    this.http.get<ResponseModel>(`${environment.api}/Requerimiento/ListarRequerimiento`, { params })
      .subscribe({
        next: (data) => {
          this.#requerimientos.update((v) => ({ ...v, requerimientos: data.data, total: data.totalCount! }));
        },
        error: (e) => console.error(e),
        complete: () => this.#requerimientos.update((v) => ({ ...v, isLoading: false })),
      });
  }

  //Datos Generales
  actualizarRequerimiento(requerimiento: RequerimientoModel): void {
    this.#requerimientos.update((v) => ({ ...v, isLoading: true }));

    if (requerimiento.tipoRequerimiento != null) requerimiento.idTipoRequerimiento = Number(requerimiento.tipoRequerimiento.value);
    if (requerimiento.tipoConsultoria != null) requerimiento.idTipoConsultoria = Number(requerimiento.tipoConsultoria.value);

    this.http.post<ResponseModel>(`${environment.api}/Requerimiento/RegistrarRequerimiento`, requerimiento)
      .subscribe({
        next: (data) => {
          this.msg.success(data.message);
          //this.#requerimientos.update((v) => ({ ...v, idRequerimientoSeleccionado: data.data }));

          this.router.navigate(
            ['/panel/requerimiento', data.data],
          );

          this.setNextStep('finish');
        },
        error: (e) => {
          console.error(e);
          this.setNextStep('error');
        },
        complete: () => {
          this.#requerimientos.update((v) => ({ ...v, isLoading: false }));
        },
      });
  }
}
