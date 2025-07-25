import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { ThemeSwitcherComponent } from '@libs/shared/components/theme-switcher/theme-switcher.component';
import { FooterComponent } from '@libs/shared/layout/footer/footer.component';
import { SuperHeaderComponent } from '@libs/shared/layout/super-header/super-header.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, SuperHeaderComponent, ThemeSwitcherComponent, FooterComponent],
  templateUrl: './auth.component.html',
  styles: ``
})
export default class AuthComponent {

}
