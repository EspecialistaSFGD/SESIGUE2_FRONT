import { computed, Injectable, signal } from '@angular/core';
import { BaseHttpService } from '../base-http.service';
import { ReporteAddRequestModel, ReporteCorteModel, ReporteFormModel, ReporteRequestModel } from '../../models/shared/reporte.model';
import { HttpParams } from '@angular/common/http';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { startOfMonth, endOfMonth, startOfDay } from 'date-fns';
import { ReporteType } from '../types/reporte.type';
import { SelectModel } from '../../models/shared/select.model';
import { GeoObjectModel, ReporteMensualModel } from '../../models/reporte/reporte.model';

interface State {
  reportes: any[];
  acuerdos: any[];
  reporteSeleccionado: any | null;
  isLoading: boolean;
  isEditing: boolean;
  total: number;
  sortField: string | null;
  sortOrder: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService extends BaseHttpService {

  #reportesResult = signal<State>({
    reportes: [],
    acuerdos: [],
    reporteSeleccionado: null,
    isLoading: false,
    isEditing: false,
    total: 0,
    sortField: null,
    sortOrder: null
  });

  public reportes = computed(() => this.#reportesResult().reportes);
  public acuerdos = computed(() => this.#reportesResult().acuerdos);
  public totalAcuerdos = computed(() => {
    return this.acuerdos().reduce((sum, item) => sum + item.totalAcuerdo, 0);
  });
  public totalEjecutados = computed(() => {
    return this.acuerdos().reduce((sum, item) => sum + item.totalEjecutado, 0);
  });
  public totalDesestimado = computed(() => {
    return this.acuerdos().reduce((sum, item) => sum + item.totalDesestimado, 0);
  });
  public totalEnProceso = computed(() => {
    return this.acuerdos().reduce((sum, item) => sum + item.totalEnProceso, 0);
  });
  public totalPendiente = computed(() => {
    return this.acuerdos().reduce((sum, item) => sum + item.totalPendiente, 0);
  });
  public totalPorcentaje = computed(() => {
    const validItems = this.acuerdos().filter(item => item.porcentaje > 0);
    const totalSum = validItems.reduce((sum, item) => sum + item.porcentaje, 0);
    const promedio = validItems.length > 0 ? totalSum / validItems.length : 0;
    return Math.round(promedio);
  });
  public reporteSeleccionado = computed(() => this.#reportesResult().reporteSeleccionado);
  public isLoading = computed(() => this.#reportesResult().isLoading);
  public isEditing = computed(() => this.#reportesResult().isEditing);
  public total = computed(() => this.#reportesResult().total);

  listarReportes(pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = 'reporteCabeceraId', sortOrder: string | null = 'descend'): void {
    let params = new HttpParams();

    this.#reportesResult.update((state) => ({
      ...state,
      isLoading: true,
    }));

    params = (pageIndex !== null) ? params.append('piCurrentPage', `${pageIndex}`) : params;
    params = (pageSize !== null) ? params.append('piPageSize', `${pageSize}`) : params;
    params = (sortField !== null) ? params.append('columnSort', `${sortField}`) : params;
    params = (sortOrder !== null) ? params.append('typeSort', `${sortOrder}`) : params;

    this.http.get<ResponseModelPaginated>(this.apiUrl + '/Reporte/Listar', { params }).subscribe({
      next: (data) => {
        const result: any[] = data.data;
        if (!result) return;
        this.#reportesResult.update((state) => ({
          ...state,
          reportes: result,
          isLoading: false,
          total: data.info.total,
        }));
      },
      error: (error) => {
        console.error(error);
        this.#reportesResult.update((state) => ({
          ...state,
          isLoading: false,
        }));
      },
      complete: () => this.#reportesResult.update((state) => ({ ...state, isLoading: false })),
    });
  }

  obtenerReporteResultado(reporteCabeceraId: number | null = null, ubigeo: string | null = null, sector: string | null, espacio: SelectModel[] | null = null, tipoAcuerdo: string | null): Promise<ResponseModel> {
    // const ots: ReporteRequestModel = {} as ReporteRequestModel;
    let params = new HttpParams();

    // if (reporteCabeceraId) ots.reporteCabeceraId = reporteCabeceraId;

    // if (ubigeo) ots.ubigeo = ubigeo;

    // if (espacio) ots.espacio = espacio;

    if (reporteCabeceraId) params = params.append('reporteCabeceraId', reporteCabeceraId);

    if (ubigeo) params = params.append('ubigeo', ubigeo);

    if (sector) params = params.append('sector', sector);

    if (espacio != null && espacio.length > 0) {
      espacio.forEach((esp: SelectModel) => {
        params = params.append('espacio[]', `${esp.label}`);
      });
    }

    // if (sector) ots.sector = sector;

    // if (tipoAcuerdo) ots.tipo = tipoAcuerdo;

    if (tipoAcuerdo) params = params.append('tipo', tipoAcuerdo);


    return new Promise((resolve, reject) => {
      this.#reportesResult.update((state) => ({ ...state, isEditing: true }));

      this.http.get<ResponseModel>(this.apiUrl + '/Reporte/ObtenerReporteResultado', { params }).subscribe({
        next: (data) => {

          if (!data.success) return;

          let results: GeoObjectModel[] = [];

          results = data.data;

          results.forEach((geo: GeoObjectModel) => {
            geo.porcentaje = Number(geo.porcentaje.toFixed(1));
            geo.porcentajeStr = `${geo.porcentaje} %`;
          });

          // console.log(results);


          this.#reportesResult.update((state) => ({ ...state, acuerdos: results }));

          resolve(data);
        },
        error: (error) => {
          console.error(error);
          reject(error);
        },
        complete: () => this.#reportesResult.update((state) => ({ ...state, isEditing: false })),
      });
    });
  }

  obtenerReporteSector(reporteCabeceraId: number | null = null, ubigeo: string | null = null, sector: string | null, espacio: SelectModel[] | null = null, tipoAcuerdo: string | null): Promise<ResponseModel> {
    let params = new HttpParams();

    if (reporteCabeceraId) params = params.append('reporteCabeceraId', reporteCabeceraId);

    if (ubigeo) params = params.append('ubigeo', ubigeo);

    if (sector) params = params.append('sector', sector);

    // if (espacio) params = params.append('espacio', espacio);

    if (espacio != null && espacio.length > 0) {
      espacio.forEach((esp: SelectModel) => {
        params = params.append('espacio[]', `${esp.label}`);
      });
    }

    if (tipoAcuerdo) params = params.append('tipo', tipoAcuerdo);


    this.#reportesResult.update((state) => ({ ...state, isLoading: true }));

    return new Promise((resolve, reject) => {
      this.http.get<ResponseModel>(this.apiUrl + '/Reporte/ReporteSector', { params }).subscribe({
        next: (data) => {
          resolve(data);
        },
        error: (error) => {
          console.error(error);
          reject(error);
        },
        complete: () => this.#reportesResult.update((state) => ({ ...state, isLoading: false })),
      });
    });
  }

  obtenerReporteClasificacion(reporteCabeceraId: number | null = null, ubigeo: string | null = null, sector: string | null, espacio: SelectModel[] | null = null, tipoAcuerdo: string | null): Promise<ReporteMensualModel[]> {
    let params = new HttpParams();

    if (reporteCabeceraId) params = params.append('reporteCabeceraId', reporteCabeceraId);

    if (ubigeo) params = params.append('ubigeo', ubigeo);

    if (sector) params = params.append('sector', sector);

    // if (espacio) params = params.append('espacio', espacio);
    if (espacio != null && espacio.length > 0) {
      espacio.forEach((esp: SelectModel) => {
        params = params.append('espacio[]', `${esp.label}`);
      });
    }

    if (tipoAcuerdo) params = params.append('tipo', tipoAcuerdo);


    this.#reportesResult.update((state) => ({ ...state, isLoading: true }));

    return new Promise((resolve, reject) => {
      this.http.get<ResponseModel>(this.apiUrl + '/Reporte/ReporteClasificacion', { params }).subscribe({
        next: (data) => {
          if (!data.success) return;

          let results: ReporteMensualModel[] = [];
          results = data.data;

          results.forEach((res: ReporteMensualModel) => {
            res.porcentaje = Number(res.porcentaje.toFixed(1));
            res.avance = `${res.porcentaje}%`;

            switch (res.tipo.trim()) {
              case 'ASISTENCIA TÉCNICA':
                res.color = '#6EC6D8';
                break;

              case 'ORIENTACIÓN':
                res.color = '#B6160F';
                break;

              case 'FINANCIAMIENTO':
                res.color = '#032E4F';
                break;

              case 'REUNION COMPLEMENTARIA':
                res.color = '#FFE230';
                break;

              case 'VISITA A TERRITORIO':
                res.color = '#B0E2CB';
                break;

              default:
                res.color = '#87C4B9';
                break;
            }

          });

          // console.log(results);

          resolve(results);
        },
        error: (error) => {
          console.error(error);
          reject(error);
        },
        complete: () => this.#reportesResult.update((state) => ({ ...state, isLoading: false })),
      });

    });
  }

  obtenerReporteMensual(reporteCabeceraId: number | null = null, ubigeo: string | null = null, sector: string | null, espacio: SelectModel[] | null = null, tipoAcuerdo: string | null): Promise<any[]> {
    let params = new HttpParams();

    if (reporteCabeceraId) params = params.append('reporteCabeceraId', reporteCabeceraId);

    if (ubigeo) params = params.append('ubigeo', ubigeo);

    if (sector) params = params.append('sector', sector);

    if (espacio != null && espacio.length > 0) {
      espacio.forEach((esp: SelectModel) => {
        params = params.append('espacio[]', `${esp.label}`);
      });
    }

    if (tipoAcuerdo) params = params.append('tipo', tipoAcuerdo);

    this.#reportesResult.update((state) => ({ ...state, isLoading: true }));

    return new Promise((resolve, reject) => {
      this.http.get<ResponseModel>(this.apiUrl + '/Reporte/ReporteMensual', { params }).subscribe({
        next: (data) => {
          if (!data.success) return;

          let results: any[] = [];
          results = data.data;

          // results.forEach((res: ReporteMensualModel) => {
          //   res.porcentaje = Number(res.porcentaje.toFixed(1));
          //   res.avance = `${res.porcentaje}%`;
          // });

          // Transformar los datos al formato requerido por G2

          // console.log(results);

          const transformedData = results.flatMap(item => [
            { tipo: 'Acuerdos', periodo: item.periodo, valor: item.acuerdos, avance: item.porcentaje + '%' },
            { tipo: 'Ejecutados', periodo: item.periodo, valor: item.ejecutados, avance: item.porcentaje + '%' },
          ]);

          resolve(transformedData);
        },
        error: (error) => {
          console.error(error);
          reject(error);
        },
        complete: () => this.#reportesResult.update((state) => ({ ...state, isLoading: false })),
      });

    });
  }

  generarReporte(req: ReporteFormModel): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      this.#reportesResult.update((state) => ({ ...state, isEditing: true }));

      const ots: ReporteAddRequestModel = {} as ReporteAddRequestModel;

      if (req.fechaInicioFin) {
        const fecha = new Date(req.fechaInicioFin);
        let primerDiaDelMes = startOfMonth(fecha);
        let ultimoDiaDelMes = endOfMonth(fecha);

        primerDiaDelMes = startOfDay(primerDiaDelMes);
        ultimoDiaDelMes = startOfDay(ultimoDiaDelMes);

        ots.fechaInicio = primerDiaDelMes;
        ots.fechaFin = ultimoDiaDelMes;
      }

      this.http.post<ResponseModel>(this.apiUrl + '/Reporte/GenerarReporte', ots).subscribe({
        next: (data) => {
          this.msg.success(data.message);
          resolve(data);
        },
        error: (error) => {
          console.error(error);
          reject(error);
        },
        complete: () => this.#reportesResult.update((state) => ({ ...state, isEditing: false })),
      });
    });
  }

  obtenerCodigo(fechaCorte: Date | null): Promise<ResponseModel> {
    let params = new HttpParams();

    if (fechaCorte) params = params.append('fechaCorte', fechaCorte.toISOString());

    return new Promise((resolve, reject) => {
      this.#reportesResult.update((state) => ({ ...state, isEditing: true }));

      this.http.get<ResponseModel>(this.apiUrl + '/Reporte/ObtenerCodigo', { params }).subscribe({
        next: (data) => {
          resolve(data);
        },
        error: (error) => {
          console.error(error);
          reject(error);
        },
        complete: () => this.#reportesResult.update((state) => ({ ...state, isEditing: false })),
      });
    });
  }

  seleccionarReporteById(reporteCabeceraId: number | null): void {
    if (reporteCabeceraId !== null && reporteCabeceraId !== undefined) {
      const reporte = this.#reportesResult().reportes.find((reporte: ReporteCorteModel) => reporte.reporteCabeceraId === reporteCabeceraId) || null;
      this.#reportesResult.update((v) => ({ ...v, reporteSeleccionado: reporte }));
    } else {
      this.#reportesResult.update((v) => ({ ...v, reporteSeleccionado: null }));
    }
  }

  descargarReporteAcuerdos(tipo: ReporteType, pageIndex: number = 1, pageSize: number = 0, sortField: string = 'PrioridadId', sortOrder: string = 'descend', grupos: number[] | null = null): Promise<ResponseModel> {
    let params = new HttpParams()
      .append('piCurrentPage', pageIndex)
      .append('piPageSize', pageSize)
      .append('columnSort', sortField)
      .append('typeSort', sortOrder);
    if (grupos) {
      for (let grupo of grupos) {
        params = params.append('grupoId[]', grupo)
      }
    }

    this.#reportesResult.update((state) => ({ ...state, isLoading: true }));

    let tipoReporte: string = '';

    switch (tipo) {
      case 'PEDIDO':
        tipoReporte = 'PrioridadAcuerdo';
        break;

      case 'ACUERDO':
        tipoReporte = 'Acuerdo';
        break;
      default:
        tipoReporte = 'HIto';
        break;
    }

    return new Promise((resolve, reject) => {

      this.http.get<ResponseModel>(`${this.apiUrl}/${tipoReporte}/Exportar`, { params }).subscribe({
        next: (data) => {
          resolve(data);
        },
        error: (error) => {
          reject(error);
        },
        complete: () => this.#reportesResult.update((state) => ({ ...state, isLoading: false })),
      })

    });
  }

  obtenerReporteTotales(reporteCabeceraId: number | null = null, ubigeo: string | null = null, sector: string | null, espacio: SelectModel[] | null = null, tipoAcuerdo: string | null): Promise<ResponseModel> {
    let params = new HttpParams();

    if (reporteCabeceraId) params = params.append('reporteCabeceraId', reporteCabeceraId);

    if (ubigeo) params = params.append('ubigeo', ubigeo);

    if (sector) params = params.append('sector', sector);

    // if (espacio) params = params.append('espacio', espacio);

    if (espacio != null && espacio.length > 0) {
      espacio.forEach((esp: SelectModel) => {
        params = params.append('espacio[]', `${esp.label}`);
      });
    }

    if (tipoAcuerdo) params = params.append('tipo', tipoAcuerdo);

    this.#reportesResult.update((state) => ({ ...state, isLoading: true }));

    return new Promise((resolve, reject) => {
      this.http.get<ResponseModel>(this.apiUrl + '/Reporte/ReporteCabecera', { params }).subscribe({
        next: (data) => {
          resolve(data);
        },
        error: (error) => {
          reject(error);
        },
        complete: () => this.#reportesResult.update((state) => ({ ...state, isLoading: false })),
      });

    });
  }
}
