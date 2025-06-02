import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-progress-spiner',
  standalone: true,
  imports: [CommonModule, PrimeNgModule],
  templateUrl: './progress-spiner.component.html',
  styles: ``
})
export class ProgressSpinerComponent {
  @Input() loading: boolean = false
}
