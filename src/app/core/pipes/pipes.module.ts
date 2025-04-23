import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeraLetraPipe } from './primera-letra.pipe';
import { NumeroPipe } from './numero.pipe';
import { SafeUrlPipe } from './safe-url.pipe';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PrimeraLetraPipe,
    NumeroPipe,
    SafeUrlPipe
  ],
  exports: [
    PrimeraLetraPipe,
    NumeroPipe,
    SafeUrlPipe
  ]
})
export class PipesModule { }
