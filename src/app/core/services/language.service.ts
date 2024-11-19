import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  getLocale(): string {
    return navigator.language || navigator.languages[0];
}
}
