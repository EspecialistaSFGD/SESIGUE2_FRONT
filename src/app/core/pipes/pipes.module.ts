import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeraLetraPipe } from './primera-letra.pipe';
import { NumeroPipe } from './numero.pipe';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PrimeraLetraPipe,
    NumeroPipe
  ],
  exports: [
    PrimeraLetraPipe,
    NumeroPipe
  ]
})
export class PipesModule { }
