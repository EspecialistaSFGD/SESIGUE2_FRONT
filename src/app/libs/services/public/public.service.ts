import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicService {

  constructor() { }

  getPublicInfo(): string {
    return 'Hola mundo';
  }
}
