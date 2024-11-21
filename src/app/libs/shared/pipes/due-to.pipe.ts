import { Pipe, PipeTransform } from '@angular/core';
import { parse, isAfter, isToday } from 'date-fns';

@Pipe({
  name: 'dueTo',
  standalone: true
})
export class DueToPipe implements PipeTransform {

  transform(plazo: string): boolean {

    if (!plazo) return false;

    const parsedPlazo = new Date(plazo);
    const today = new Date();

    return isAfter(today, parsedPlazo);
  }

}
