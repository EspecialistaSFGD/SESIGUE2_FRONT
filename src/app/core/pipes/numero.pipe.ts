import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numero',
  standalone: true
})
export class NumeroPipe implements PipeTransform {

  transform(value: string | number, decimal: number = 0): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimal }).format(Number(value));
  }

}
