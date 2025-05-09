import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-inversion-mesa',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './inversion-mesa.component.html',
  styles: ``
})
export default class InversionMesaComponent {
  title: string = `Intervención de la mesa`;
}