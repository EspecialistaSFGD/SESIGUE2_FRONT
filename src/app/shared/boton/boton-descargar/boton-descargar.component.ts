import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { generateBase64ToArrayBuffer } from '@core/helpers';
import { DescargarService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import saveAs from 'file-saver';

@Component({
  selector: 'app-boton-descargar',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './boton-descargar.component.html',
  styles: ``
})
export class BotonDescargarComponent {

  @Input() rutaArchivo:string = ''

  private descargarServices = inject(DescargarService)

  descargarPdf(archivo: string){
      this.descargarServices.descargarPdf(archivo)
        .subscribe((resp) => {        
          if (resp.success == true) {
            var binary_string = generateBase64ToArrayBuffer(resp.data.binario);
            var blob = new Blob([binary_string], { type: `application/${resp.data.tipo}` });
            saveAs(blob, resp.data.nombre);
          }
        })
    }
}
