import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { LanguageService } from '@core/services/language.service';
import { PrimeNGConfig } from 'primeng/api';
import { PRIME_ES } from './config/i18n/prime-ng/primeng-es';

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

  constructor(private primeNgConfig: PrimeNGConfig){}

  ngOnInit(): void {
    this.primeNgConfig.setTranslation(PRIME_ES)
  }
}
