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
      case 'Pendiente':
        return 'warning';
      default:
        return 'default';
    }
  });


  constructor() { }

  ngOnInit(): void { }
}
