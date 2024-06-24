import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, UntypedFormGroup } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/layout/page-header/page-header.component';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { AcuerdosService } from '../../../libs/services/pedidos/acuerdos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HitosService } from '../../../libs/services/pedidos/hitos.service';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { TraerAvancesInterface, TraerHitosInterface } from '../../../libs/interfaces/pedido/pedido.interface';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { AvancesService } from '../../../libs/services/pedidos/avances.service';
import { HitoAcuerdoModel } from '../../../libs/models/pedido';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-acuerdo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    NzDescriptionsModule,
    NzTableModule,
    NzButtonModule,
    NzSpaceModule,
    NzToolTipModule,
    NzDropDownModule,
    NzIconModule,
    NzRadioModule,
  ],
  templateUrl: './acuerdo.component.html',
  styleUrl: './acuerdo.component.less'
})
export class AcuerdoComponent implements OnInit {
  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';

  // title: string = `Gestión de hitos para el ...`;
  id: string | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  sortField: string = 'hitoId';
  sortOrder: string = 'ascend';

  pageIndexAvance: number = 1;
  pageSizeAvance: number = 10;
  sortFieldAvance: string = 'avanceId';
  sortOrderAvance: string = 'ascend';
  hitoSeleccionadoId: number | null = null; // ID del hito seleccionado
  hitoSeleccionado: HitoAcuerdoModel | null = null;
  queryParamsChangeEventCnt = 0;
  evidenciaBaseUrl = 'https://sesigue.com/SESIGUE/SD/evidencia/';

  private updateParamsSubject: Subject<void> = new Subject<void>();
  private updatingParams: boolean = false;

  public acuerdosService = inject(AcuerdosService);
  public hitosService = inject(HitosService);
  public avancesService = inject(AvancesService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!this.id) {
      // Maneja la ausencia del ID, por ejemplo, redirigiendo a otra página o mostrando un mensaje de error
      this.router.navigate(['/panel']); // Redirige a una página de error
      // O muestra un mensaje de error en el componente
      console.error('ID no encontrado en la URL');
    } else {
      // El ID está presente, puedes continuar con tu lógica
      this.acuerdosService.listarAcuerdo(Number(this.id));
      // this.hitosService.listarHitos(Number(this.id));
    }

    this.activatedRoute.queryParams.subscribe((params) => {
      if (!this.updatingParams) {
        if (!this.updatingParams) {
          if (params['hito'] != null) {
            this.hitoSeleccionadoId = Number(params['hito']);
          }
        }
      }
    });

    // Debounce los cambios de parámetros de la URL
    this.updateParamsSubject.pipe(debounceTime(300)).subscribe(() => {
      this.updateQueryParams();
    });
  }

  ngOnInit(): void {
  }

  traerHitos({
    acuerdoID = Number(this.id) || null,
    pageIndex = this.pageIndex,
    pageSize = this.pageSize,
    sortField = this.sortField,
    sortOrder = this.sortOrder
  }: TraerHitosInterface): void {
    this.hitosService.listarHitos(acuerdoID, pageIndex, pageSize, sortField, sortOrder);
  }

  traerAvances({
    hitoId = null,
    pageIndex = this.pageIndexAvance,
    pageSize = this.pageSizeAvance,
    sortField = this.sortFieldAvance,
    sortOrder = this.sortOrderAvance
  }: TraerAvancesInterface): void {
    this.avancesService.listarAvances(hitoId, pageIndex, pageSize, sortField, sortOrder);
  }

  onHitoSelected(hitoId: number): void {
    if (hitoId == null) return;
    this.hitoSeleccionadoId = hitoId;
    this.traerAvances({ hitoId: Number(hitoId) });
    this.updateParamsSubject.next();
  }

  updateQueryParams() {
    this.updatingParams = true;

    const queryParams = {
      hito: this.hitoSeleccionadoId,
    };

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge'
    }).finally(() => {
      this.updatingParams = false;
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort } = params;
    const currentSort = sort.find(item => item.value !== null);
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sortField = (currentSort && currentSort.key) || this.sortField;
    this.sortOrder = (currentSort && currentSort.value) || this.sortOrder;

    this.traerHitos({
      acuerdoID: Number(this.id),
      pageIndex,
      pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder
    });
  }

  onQueryParamsChangeAvances(params: NzTableQueryParams): void {
    // if (++this.queryParamsChangeEventCnt == 1) return;

    if (!this.updatingParams) {

      const { pageSize, pageIndex, sort } = params;
      const currentSort = sort.find(item => item.value !== null);
      this.pageIndexAvance = pageIndex;
      this.pageSizeAvance = pageSize;
      this.sortFieldAvance = (currentSort && currentSort.key) || this.sortFieldAvance;
      this.sortOrderAvance = (currentSort && currentSort.value) || this.sortOrderAvance;
      this.traerAvances({
        hitoId: this.hitoSeleccionadoId,
        pageIndex,
        pageSize,
        sortField: this.sortFieldAvance,
        sortOrder: this.sortOrderAvance
      });

      // Emitir cambios de parámetros
      this.updateParamsSubject.next();
    }

  }
}
