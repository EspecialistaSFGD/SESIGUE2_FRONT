import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeraLetraPipe } from './primera-letra.pipe';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PrimeraLetraPipe
  ],
  exports: [
    PrimeraLetraPipe
  ]
})
export class PipesModule { }
