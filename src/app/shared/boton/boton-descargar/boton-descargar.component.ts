import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { generateBase64ToArrayBuffer } from '@core/helpers';
import { DescargarService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import saveAs from 'file-saver';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-boton-descargar',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PrimeNgModule],
  providers: [MessageService],
  templateUrl: './boton-descargar.component.html',
  styles: ``
})
export class BotonDescargarComponent {

  @Input() rutaArchivo:string = ''
  @Input() active: boolean = true
  @Input() titulo: string = 'Descargar'
  @Input() label: string = ''
  @Input() icono: string = 'pi-file-pdf'
  @Input() preload: boolean = true

  loading: boolean = false

  private descargarServices = inject(DescargarService)
  private messageService = inject(MessageService)

  descargarPdf(archivo: string){
    this.loading = true
      this.descargarServices.descargarPdf(archivo)
        .subscribe((resp) => {       
          if (resp.success == true) {
            var binary_string = generateBase64ToArrayBuffer(resp.data.binario);
            var blob = new Blob([binary_string], { type: `application/${resp.data.tipo}` });
            saveAs(blob, resp.data.nombre);
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: resp!.message });
          }
          this.loading = false
        })
    }
}
