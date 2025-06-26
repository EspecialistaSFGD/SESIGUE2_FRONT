import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { CardComponent } from '@shared/card/card.component';
import { TableCardComponent } from '@shared/table-card/table-card.component';

@Component({
  selector: 'app-intervencion-panel-aptos',
  standalone: true,
  imports: [CommonModule, CardComponent, TableCardComponent, NgZorroModule],
  templateUrl: './intervencion-panel-aptos.component.html',
  styles: ``
})
export class IntervencionPanelAptosComponent {
}
