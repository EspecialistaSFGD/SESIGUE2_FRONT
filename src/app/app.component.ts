import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  providers: [
    {
        provide: LOCALE_ID,
        useFactory: (localeService: LanguageService) => localeService.getLocale(),
        deps: [LanguageService],
    },
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title: string = 'SESIGUE2_FRONT';
}
