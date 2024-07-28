import { Component, Input, OnInit, computed, signal } from '@angular/core';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

@Component({
  selector: 'app-estado',
  standalone: true,
  imports: [NzBadgeModule],
  templateUrl: './estado.component.html',
  styles: `
  .ant-badge-status{
    display: flex;
    align-items: center;
  }
  `
})
export class EstadoComponent implements OnInit {
  @Input({ required: true }) title!: string;

  public estado = computed(() => {
    switch (this.title) {
      case 'PENDIENTE':
        return 'warning';
      case 'CULMINADO':
        return 'success';
      case 'Activo':
        return 'success';
      case 'EN PROCESO':
        return 'processing';
      case 'DESESTIMADO':
        return 'error';
      default:
        return 'default';
    }
  });


  constructor() { }

  ngOnInit(): void { }
}
