import { CommonModule } from '@angular/common';
import { Component, inject, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTabChangeEvent, NzTabsModule } from 'ng-zorro-antd/tabs';
import { ThemeSwitcherComponent } from '../../libs/shared/components/theme-switcher/theme-switcher.component';
import { FooterComponent } from '../../libs/shared/layout/footer/footer.component';
import { SuperHeaderComponent } from '../../libs/shared/layout/super-header/super-header.component';
import { FormLoginComponent } from './form/form-login/form-login.component';
import { RegisterComponent } from './forms/register/register.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTabsModule,
    FormLoginComponent,
    RegisterComponent,
    NzLayoutModule,
    NzCardModule,
    ThemeSwitcherComponent,
    SuperHeaderComponent,
    FooterComponent,
  ],
  templateUrl: './login.component.html',
})
export default class LoginComponent {
  // private route: ActivatedRoute = inject(ActivatedRoute);
  // private router = inject(Router);
  // private authService = inject(AuthService);
  private renderer = inject(Renderer2);
  login: boolean = true

  // ngOnInit(): void {
  //   this.addBodyClass('auth');
  // }

  // ngOnDestroy(): void {
  //   this.removeBodyClass('auth');
  // }

  // addBodyClass(className: string): void {
  //   this.renderer.addClass(document.body, className);
  // }

  // removeBodyClass(className: string): void {
  //   this.renderer.removeClass(document.body, className);
  // }

  actiontabs(event: NzTabChangeEvent){    
    this.login = event.index == 0    
  }
}
