import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../libs/services/auth/auth.service';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ThemeSwitcherComponent } from '../libs/shared/components/theme-switcher/theme-switcher.component';
import { SuperHeaderComponent } from '../libs/shared/layout/super-header/super-header.component';
import { FooterComponent } from '../libs/shared/layout/footer/footer.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTabsModule,
    LoginComponent,
    RegisterComponent,
    NzLayoutModule,
    NzCardModule,
    ThemeSwitcherComponent,
    SuperHeaderComponent,
    FooterComponent,
  ],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit, OnDestroy {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private renderer = inject(Renderer2);
  public currentAction!: string;

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (!params['action']) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { action: 'login' },
          queryParamsHandling: 'merge',
        });
      } else {
        this.currentAction = params['action'];
      }
    });
  }

  ngOnInit(): void {
    this.addBodyClass('auth');
  }

  ngOnDestroy(): void {
    this.removeBodyClass('auth');
  }

  addBodyClass(className: string): void {
    this.renderer.addClass(document.body, className);
  }

  removeBodyClass(className: string): void {
    this.renderer.removeClass(document.body, className);
  }
}
