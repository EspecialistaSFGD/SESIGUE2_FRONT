import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { HitosService } from '../../../services/pedidos/hitos.service';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { ComentarioModel } from '../../../models/pedido/comentario.model';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { saveAs } from 'file-saver';
import { UtilesService } from '../../services/utiles.service';
import { AcuerdosService } from '../../../services/pedidos/acuerdos.service';
@Component({
  selector: 'app-desestimacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzGridModule,
    NzUploadModule,
    NzButtonModule,
  ],
  templateUrl: './desestimacion.component.html',
  styles: ``
})
export class DesestimacionComponent {
  desestimacionForm!: UntypedFormGroup;
  fileList: NzUploadFile[] = [];
  private utilesService = inject(UtilesService);
  private acuerdosService = inject(AcuerdosService);
  readonly nzModalData: ComentarioModel = inject(NZ_MODAL_DATA);

  private fb = inject(UntypedFormBuilder);

  constructor() {
    this.crearDesestimacionForm();
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    if (file == null) return false;

    const originalFile: File | null = this.utilesService.getOriginalFile(file);

    this.fileList = [];

    this.fileList = this.fileList.concat({
      ...file,
      status: 'done',
      name: file.name,
      url: URL.createObjectURL(file as any) // Crear una URL para descargar el archivo subido
    });

    if (this.fileList.length > 0) {
      if (originalFile != null) {
        this.desestimacionForm.get('evidencia')?.patchValue(originalFile);
        this.desestimacionForm.get('evidenciaDesestimacion')?.patchValue(originalFile.name);
      }
    }

    return false; // Evita la carga automática del archivo
  };

  onDeleteFiles = (file: NzUploadFile): boolean => {
    this.fileList = [];
    this.desestimacionForm.get('evidencia')?.patchValue(null);
    this.desestimacionForm.get('evidenciaDesestimacion')?.patchValue(null);

    return false;
  }

  handleDownload = (file: NzUploadFile): void => {
    const evidenciaDesestimacion = this.desestimacionForm.get('evidenciaDesestimacion')?.value;
    const idArchivo = this.desestimacionForm.get('avanceId')?.value;

    if (evidenciaDesestimacion != '' && evidenciaDesestimacion != null) { // viene del servidor
      this.acuerdosService.descargarEvidenciaDesestimacion(idArchivo).then((res) => {
        // console.log(res);

        if (res.success == true) {
          var binary_string = this.utilesService.base64ToArrayBuffer(res.data[0].binario);
          var blob = new Blob([binary_string], { type: `application/${res.data[0].tipo}` });

          saveAs(blob, res.data[0].nombre);
        }
      });
    } else {
      if (file.url) {
        window.open(file.url);
      }
    }
  };

  crearDesestimacionForm(): void {
    this.desestimacionForm = this.fb.group({
      acuerdoId: [this.nzModalData.id, [Validators.required]],
      tipo: [this.nzModalData.tipo],
      motivoDesestimacion: [null, [Validators.required]],
      evidencia: [this.acuerdosService.acuerdoSeleccionado()?.evidencia],
      evidenciaDesestimacion: [this.acuerdosService.acuerdoSeleccionado()?.evidenciaDesestimacion, [Validators.required]],
    });
  }
}
