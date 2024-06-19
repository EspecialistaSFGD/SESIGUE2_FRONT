import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { PageHeaderComponent } from '../../shared/layout/page-header/page-header.component';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { EstadoComponent } from '../../shared/components/estado/estado.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzCardModule } from 'ng-zorro-antd/card';
import { AnchorModel } from '../../libs/models/shared/anchor.model';
import { PedidosService } from '../../libs/services/pedidos/pedidos.service';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { SelectModel } from '../../libs/models/shared/select.model';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTableModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputModule,
    NzIconModule,
    EstadoComponent,
    NzButtonModule,
    NzSpaceModule,
    NzCardModule,
    NzDropDownModule,
    NzDrawerModule,
    NzBadgeModule,
  ],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.less'
})
export class PedidosComponent implements OnInit{
  searchForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  entidadSeleccionada: SelectModel = { value: '1', label: 'GOBIERNO REGIONAL DE LORETO' };
  title: string = `Lista de pedidos de ${this.entidadSeleccionada.label}`;
  breadcrumbs: AnchorModel[] = [];
  links: AnchorModel[] = [];
  pageIndex: number = 1;
  pageSize: number = 10;
  total: number = 0;
  sortField: string | null = 'prioridadID';
  sortOrder: string | null = 'descend';
  isDrawervisible: boolean = false;
  
  public pedidosService = inject(PedidosService);
  private fb = inject(UntypedFormBuilder);

  constructor() {
    this.crearSearForm();
  }

  ngOnInit(): void {
    // this.pedidosService.traerPedidos();
  }

  onEspacioChange(value: any): void {}
  
  onSectorChange(value: any): void {}
  
  onDepChange(value: any): void {}
  
  onProvChange(value: any): void {}

  onDelete(value:any): void {}

  onOpenDrawer(): void {
    this.isDrawervisible = true;
  }

  onCloseDrawer(): void {
    this.isDrawervisible = false;
  }
  
  crearSearForm(): void {
    this.searchForm = this.fb.group({
      espacio: [null],
      sector: [null],
      dep: [null],
      prov: [null],
    });
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find(item => item.value !== null);
    const sortField = (currentSort && currentSort.key) || this.sortField;
    const sortOrder = (currentSort && currentSort.value) || this.sortOrder;

    this.pedidosService.listarPedidos(
      pageIndex,
      pageSize,
      sortField,
      sortOrder
    );
  }
}
