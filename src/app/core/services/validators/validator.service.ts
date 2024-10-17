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
}