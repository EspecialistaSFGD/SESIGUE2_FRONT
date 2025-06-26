import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { themeProgressBarPercente } from '@core/helpers';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { CardComponent } from '@shared/card/card.component';
import { TableCardComponent } from '@shared/table-card/table-card.component';

@Component({
  selector: 'app-intervencion-panel-nivel-gobierno',
  standalone: true,
  imports: [CommonModule, CardComponent, TableCardComponent, NgZorroModule],
  templateUrl: './intervencion-panel-nivel-gobierno.component.html',
  styles: ``
})
export class IntervencionPanelNivelGobiernoComponent {

  colorBarraProgreso(porcentaje: number): string {
    return themeProgressBarPercente(porcentaje)
  }
}
