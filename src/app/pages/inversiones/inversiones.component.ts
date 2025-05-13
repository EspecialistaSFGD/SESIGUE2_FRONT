import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-inversiones',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './inversiones.component.html',
  styles: ``
})
export default class InversionesComponent {
  title: string = `Inversiones`;
}
