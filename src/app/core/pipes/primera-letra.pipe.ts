import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'primeraLetra',
  standalone: true
})
export class PrimeraLetraPipe implements PipeTransform {
  transform ( value: string, qty: number = 0  ): string {
    const words = value.split(' ')
    if( qty > 0 && words.length > qty ){
      words.length = qty
    }

    const letters = words.map( item => item.slice(0,1) )
    return letters.join('').toUpperCase();
  }
}
