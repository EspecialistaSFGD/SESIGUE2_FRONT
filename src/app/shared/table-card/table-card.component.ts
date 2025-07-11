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

  setScrollY() {
    return this.scrollY == 0 ? null : `${this.scrollY}px`
  }

  setScrollX(){
    return this.scrollX == 0 ? null : `${this.scrollX}px`
  }
}
