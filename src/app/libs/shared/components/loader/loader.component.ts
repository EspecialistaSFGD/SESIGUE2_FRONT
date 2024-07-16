import { Component } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    NzIconModule,
  ],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.less'
})
export class LoaderComponent {

}
