import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './table-card.component.html',
  styles: ``
})
export class TableCardComponent {
  @ContentChild('header', { static: true }) headerTemplate!: TemplateRef<any>;
  @ContentChild('body', { static: true }) bodyTemplate!: TemplateRef<any>;
  @ContentChild('footer', { static: true }) footerTemplate!: TemplateRef<any>;

  @Input() fixed: boolean = false
  @Input() scrollY: number = 0;
  @Input() scrollX: number = 0;

  setScroll(){
    const scroll: { x?: string; y?: string } = {};
    if (this.scrollY > 0) scroll.y = `${this.scrollY}px`;
    if (this.scrollX > 0) scroll.x = `${this.scrollX}px`;

    return scroll;
  }
}
