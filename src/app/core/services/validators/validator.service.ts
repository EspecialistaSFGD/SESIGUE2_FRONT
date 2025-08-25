import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

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
  public passwordPattern: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,12}$/
  public amountPattern: RegExp = /^\d{1,12}(\.\d{1,2})?$/

  // letras numero y guion al medio
  public codigoPattern: RegExp = /^[a-zA-Z0-9-]$/

  public sixNumberPattern: RegExp = /^\d{6}$/
  public sevenNumberPattern: RegExp = /^\d{7}$/

  public startFiveNumberPattern: RegExp = /^5\d{5,6}$/

  // Nombre que inicia con 'MT_'
  // public slugMTPattern: RegExp = /^MT_.+$/;

  public slugMTPattern: RegExp = /^MT_.{3,}$/;

  controlEquals( control:string, compare:string ) {
    return ( formGroup: AbstractControl ):ValidationErrors | null => {
      const first = formGroup.get( control )?.value
      const second = formGroup.get( compare )?.value

      if( second != first ){
        formGroup.get( compare )?.setErrors({ notSame:true })
        return { notSame: true }
      }
      formGroup.get( compare )?.setErrors( null )
      return null
    }
  }
}
