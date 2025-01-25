import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CargaMasivaResponse } from '@core/interfaces/carga-masiva.interface';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './detalles.component.html',
  styles: ``
})
export class DetallesComponent {
	title: string = 'Detalle de Carga Masiva'

	@Input() showModalDetail!: boolean
	@Input() cargaMasiva!: CargaMasivaResponse

	@Output() setCloseShow = new EventEmitter()

	closeModal(){
		this.setCloseShow.emit(false)
	}
}
