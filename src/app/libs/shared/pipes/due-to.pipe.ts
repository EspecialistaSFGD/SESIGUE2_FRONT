import { Pipe, PipeTransform } from '@angular/core';
import { parse, isAfter, isToday } from 'date-fns';

@Pipe({
  name: 'dueTo',
  standalone: true
})
export class DueToPipe implements PipeTransform {

  transform(plazo: string): string {
    const parsedPlazo = parse(plazo, 'dd/MM/yyyy', new Date());
    const today = new Date();

    return isAfter(today, parsedPlazo) ? 'text-red-500' : 'due-date-okay';
  }

}
