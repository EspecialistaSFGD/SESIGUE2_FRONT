import { Component, Input, OnInit, SimpleChanges, computed, signal, Signal, booleanAttribute } from '@angular/core';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-estado',
  standalone: true,
  imports: [NzBadgeModule, NzTagModule, NzIconModule],
  templateUrl: './estado.component.html',
  styles: `
  .ant-badge-status {
    display: flex;
    align-items: center;
  }
  `
})
export class EstadoComponent implements OnInit {
  @Input({ required: true }) title!: string;
  @Input({ transform: booleanAttribute }) isBadge: boolean = true;

  titleSignal = signal(this.title);
  isBadgeSignal = signal(this.isBadge);

  color: Signal<string>;
  iconType: Signal<string>;

  constructor() {
    this.color = computed(() => {
      const normalizedTitle = this.titleSignal().toUpperCase();
      switch (normalizedTitle) {
        case 'PENDIENTE':
          return 'warning';
        case 'CULMINADO':
          return 'success';
        case 'ACTIVO':
          return 'success';
        case 'EN PROCESO':
          return 'processing';
        case 'DESESTIMADO':
          return 'error';
        default:
          return 'default';
      }
    });

    this.iconType = computed(() => {
      const normalizedTitle = this.titleSignal().toUpperCase();
      switch (normalizedTitle) {
        case 'PENDIENTE':
          return 'close-circle';
        case 'CULMINADO':
          return 'check-circle';
        case 'ACTIVO':
          return 'check-circle';
        case 'EN PROCESO':
          return 'sync';
        case 'DESESTIMADO':
          return 'close-circle';
        default:
          return 'question-circle';
      }
    });
  }

  ngOnInit(): void {
    this.updateSignals();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['title'] || changes['isBadge']) {
      this.updateSignals();
    }
  }

  private updateSignals(): void {
    this.titleSignal.set(this.title);
    this.isBadgeSignal.set(this.isBadge);
  }
}
