import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeraLetraPipe } from './primera-letra.pipe';
import { NumeroPipe } from './numero.pipe';
import { SafeUrlPipe } from './safe-url.pipe';
import { ReplacePipe } from './replace.pipe';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PrimeraLetraPipe,
    NumeroPipe,
    SafeUrlPipe,
    ReplacePipe
  ],
  exports: [
    PrimeraLetraPipe,
    NumeroPipe,
    SafeUrlPipe,
    ReplacePipe
  ]
})
export class PipesModule { }
