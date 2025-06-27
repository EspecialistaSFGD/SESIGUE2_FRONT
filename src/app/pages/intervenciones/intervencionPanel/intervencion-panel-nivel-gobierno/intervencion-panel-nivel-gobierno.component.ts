import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { themeProgressBarPercente } from '@core/helpers';
import { InterfacePanelResult } from '@core/interfaces/intervencion.interface';
import { PipesModule } from '@core/pipes/pipes.module';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { CardComponent } from '@shared/card/card.component';
import { TableCardComponent } from '@shared/table-card/table-card.component';

@Component({
  selector: 'app-intervencion-panel-nivel-gobierno',
  standalone: true,
  imports: [CommonModule, CardComponent, TableCardComponent, NgZorroModule, PipesModule],
  templateUrl: './intervencion-panel-nivel-gobierno.component.html',
  styles: ``
})
export class IntervencionPanelNivelGobiernoComponent {
  @Input() intervencionNivelesGobierno: InterfacePanelResult[] = []

  colorBarraProgreso(porcentaje: number): string {
    return themeProgressBarPercente(porcentaje)
  }
}
