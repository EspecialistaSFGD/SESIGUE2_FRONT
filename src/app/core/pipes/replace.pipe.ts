import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace',
  standalone: true
})
export class ReplacePipe implements PipeTransform {

  transform(value: string, from:string =  ' ', to:string = '_' ): string {    
    return value.replaceAll( from,to  )
  }

}
