import { booleanAttribute, Component, inject, Input } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [
    CommonModule,
    NzDropDownModule
  ],
  templateUrl: './theme-switcher.component.html',
  styles: ``
})
export class ThemeSwitcherComponent {
  public authService = inject(AuthService);
  @Input({ transform: booleanAttribute }) isAbsolute: boolean = true;
  @Input({ transform: booleanAttribute }) isRounded: boolean = true;
  @Input({ transform: booleanAttribute }) hasInitialDarkBackground: boolean = false;
}
