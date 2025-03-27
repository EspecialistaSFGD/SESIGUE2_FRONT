import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MesaFilesResponse, Pagination } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';

@Component({
  selector: 'app-mesa-detalles',
  standalone: true,
  imports: [CommonModule, RouterModule , NgZorroModule, PageHeaderComponent],
  templateUrl: './mesa-detalles.component.html',
  styles: ``
})
export default class MesaDetallesComponent {
  title: string = `Mesas`;

  files: MesaFilesResponse[] = [
    {id: '1', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Dario', fecha: '07/03/2024' },
    {id: '2', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Denisse', fecha: '22/02/2024' },
    {id: '3', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Cecilia', fecha: '15/01/2024' },
    {id: '4', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Pamela', fecha: '28/12/2023' },
    {id: '5', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Veronica', fecha: '12/11/2023' },
  ]

  loadingData: boolean = false

  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }
}
