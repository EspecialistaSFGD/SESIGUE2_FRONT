import { AfterViewInit, Component, inject, signal, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../libs/shared/layout/page-header/page-header.component';
import { CommonModule } from '@angular/common';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Chart, register } from '@antv/g2';
import { feature } from 'topojson';
import { MapService } from '../../libs/shared/services/map.service';
import { environment } from '../../../environments/environment';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { UtilesService } from '../../libs/shared/services/utiles.service';
import { ReporteComponent } from './reporte/reporte.component';
import { ReportesService } from '../../libs/shared/services/reportes.service';
import { AcuerdoReporteModel } from '../../libs/models/pedido/acuerdo.model';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { TraerReportesCorteInterface } from '../../libs/models/shared/reporte.model';
import { NzSpaceModule } from 'ng-zorro-antd/space';

// @ts-ignore
register('data.feature', ({ name }) => {
  // @ts-ignore
  return (data: any) => feature(data, data.objects[name]).features;
});

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzStatisticModule,
    NzDatePickerModule,
    NzSpaceModule,
    NzIconModule,
    PageHeaderComponent,
    NzTableModule,
  ],
  templateUrl: './reportes.component.html',
  styles: ``,
})
export class ReportesComponent implements AfterViewInit {

  pageIndex: number = 1;
  pageSize: number = 5;
  sortField: string | null = 'reporteCabeceraId';
  sortOrder: string | null = 'descend';

  private mapService = inject(MapService);

  private modal = inject(NzModalService);
  public utilesService = inject(UtilesService);
  public reportesService = inject(ReportesService);
  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);

  acuerdos = signal<AcuerdoReporteModel[]>([]);
  geoChart: Chart | null = null;

  date = null;

  onChange(result: any): void {
    console.log('onChange: ', result);
  }

  ngAfterViewInit(): void {
    this.geoChart = new Chart({
      container: 'container',
      autoFit: true,
    });

    // this.renderCharts();
  }

  traerReporte({
    pageIndex = this.pageIndex,
    pageSize = this.pageSize,
    sortField = this.sortField,
    sortOrder = this.sortOrder
  }: TraerReportesCorteInterface): void {
    this.reportesService.listarReportes(pageIndex, pageSize, sortField, sortOrder);
  }

  onAddReport(): void {
    const modal = this.modal.create<ReporteComponent>({
      nzTitle: 'Agregar Reporte',
      nzContent: ReporteComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzClosable: false,
      nzMaskClosable: false,
      nzFooter: [
        {
          label: 'Cancelar',
          onClick: () => {
            modal.close();
          },
        },
        {
          label: 'Generar',
          type: 'primary',
          onClick: (componentInstance) => {
            return this.reportesService.generarReporte(componentInstance!.reporteForm.value).then(() => {
              this.traerReporte({});

              modal.close();
            });
          },
          loading: this.reportesService.isEditing(),
          disabled: (componentInstance) => !componentInstance?.reporteForm.valid,
        },
      ],
    });

    const instance = modal.getContentComponent();
    modal.afterClose.subscribe(result => {
      instance.reporteForm.reset();
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort } = params;
    const currentSort = sort.find(item => item.value !== null);
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sortField = (currentSort && currentSort.key) || this.sortField;
    this.sortOrder = (currentSort && currentSort.value) || this.sortOrder;

    this.traerReporte({ pageIndex, pageSize, sortField: this.sortField, sortOrder: this.sortOrder });
  }


}
