import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {
  public DNIPattern:RegExp = /^[0-9]{8}$/
  public phonePattern:RegExp = /^9+[0-9]{8}$/
  public mailPattern: RegExp = /^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$/
  public timePatter: RegExp = /^([0-1][0-9]|2[0-3])(:)([0-5][0-9])$/
  public NumberPattern: RegExp = /^[1-9]\d*$/
  public userPattern: RegExp = /^\d{8}$/
  public passwordPattern: RegExp = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\~-]{6,}$/

  // letras numero y guion al medio
  public codigoPattern: RegExp = /^[a-zA-Z0-9-]$/

  public sixNumberPattern: RegExp = /^\d{6}$/
  public sevenNumberPattern: RegExp = /^\d{7}$/

  public startFiveNumberPattern: RegExp = /^5\d{5,6}$/
}
