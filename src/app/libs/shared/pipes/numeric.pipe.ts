import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numeric',
  standalone: true
})
export class NumericPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/\D/g, '');
  }

}
