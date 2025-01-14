import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';

@Component({
  selector: 'app-sgd',
  standalone: true,
  imports: [
    PageHeaderComponent,
    NgZorroModule,
    RouterModule
  ],
  templateUrl: './sgd.component.html',
  styles: ``
})
export default class SgdComponent {
  title:string = 'Sistema de gestión documentaria'
}
