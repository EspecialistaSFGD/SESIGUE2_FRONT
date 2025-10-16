import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-boton',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './boton.component.html',
  styles: ``
})
export class BotonComponent {
  @Input() texto: string = ''
  @Input() color: string = 'sky'
  @Input() colorDark: string = 'sky'
  @Input() icono: string = 'eye'
  @Input() tooltip: string = ''
  @Input() stepColor: number = 700
  @Input() link: boolean = false
  @Input() outline: boolean = false
  @Input() disabled: boolean = false
  @Input() loading: boolean = false

  get claseColor(){
    return[this.setColor()]
  }

  setColor(){
    let padd = this.link ? 'px-2' : 'px-3'
    let claseColor = `flex items-center gap-1 py-2 ${padd} rounded border`;
    let bg = this.link ? `bg-transparent` : `bg-${this.color}-${this.stepColor} hover:bg-${this.color}-800 dark:bg-${this.colorDark}-800`
    let border = this.link ? `border-transparent` : `border-${this.color}-${this.stepColor} hover:border-${this.color}-800 dark:border-${this.colorDark}-800`
    let text = this.link ? `text-${this.color}-${this.stepColor}` :`text-white`
    let cursor = this.disabled ? '' : 'cursor-pointer'

    if(this.outline  && !this.disabled){
      bg = `transparent hover:bg-${this.color}-${this.stepColor}`
      border = `border-${this.color}-${this.stepColor}`
      text = `text-${this.color}-${this.stepColor} hover:text-white`
    }
    
    if(this.disabled){      
      bg = this.link ? 'bg-transparent' : 'bg-slate-100'
      border = this.link ? 'border-transparent' : 'border-slate-200'
      text = 'text-slate-300'
    }

    claseColor = `${claseColor} ${cursor} ${bg} ${border} ${text} ${padd}`
    return claseColor
  }
}
