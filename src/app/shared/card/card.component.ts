import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styles: ``
})
export class CardComponent {
  @Input() titulo:string = ''
  @Input() py:string = 'py-4'
  @Input() px:string = 'px-4'

  @ContentChild('content', { static: true }) contentTemplate!: TemplateRef<any>;
}
