import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Pagination } from '@core/interfaces';
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
  title: string = `Sistema de Gestión Documentaria`;

  loadingData: boolean = false

  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }


  mesas:string[] = ['Mesa Técnica para el Desarrollo de la Provinicia de Condorcanqui - Amazonas','Mesa Técnica para el Desarrollo Integral de la provincia de Vilcas Huamán del departamento de Ayacucho','Mesa Técnica para el Desarrollo   Territorial de la provincia de Urubamba del   departamento de Cusco','Subgrupo de Trabajo 3: Plan de Desarrollo del “Espacio de diálogo para el desarrollo de la provincia de Cotabambas y distrito de Progreso de la provincia de Grau del departamento de Apurímac”']

}
