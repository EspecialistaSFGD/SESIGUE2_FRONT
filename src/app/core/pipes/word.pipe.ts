import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'word',
  standalone: true
})
export class WordPipe implements PipeTransform {

  transform( text: string, qty: number = 0  ): string {
    const words = text.split(' ')
    if( qty > 0 && words.length > qty ){
      words.length = qty
    }    
    return words.join(' ');
  }

}
