import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SectorResponse } from '@core/interfaces';
import { SectoresService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-intervencion-panel-filtros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './intervencion-panel-filtros.component.html',
  styles: ``
})
export class IntervencionPanelFiltrosComponent {

  sectores = signal<SectorResponse[]>([])

  private fb = inject(FormBuilder)
  private sectorService = inject(SectoresService)

  formFilterPanel: FormGroup = this.fb.group({
    tipoEspacio: [''],
    eventiId: [''],
    entidadUbigeoId: [''],
    sectorId: [''],
    nivelGobierno: [''],
    codigoUnico: [''],
  })
  ngOnInit(): void {
    this.obtenerSectoresServices()
  }

  obtenerSectoresServices(){
    this.sectorService.getAllSectors().subscribe( resp => this.sectores.set(resp.data.filter( item => Number(item.grupoID) >= 1)))
  }
}
