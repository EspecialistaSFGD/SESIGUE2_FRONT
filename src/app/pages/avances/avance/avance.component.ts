import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { HitosService } from '../../../libs/services/pedidos/hitos.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AcuerdosService } from '../../../libs/services/pedidos/acuerdos.service';
import { AvancesService } from '../../../libs/services/pedidos/avances.service';
import { SectoresStore } from '../../../libs/shared/stores/sectores.store';
import { SelectModel } from '../../../libs/models/shared/select.model';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { UtilesService } from '../../../libs/shared/services/utiles.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-avance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzGridModule,
    NzDatePickerModule,
    NzSelectModule,
    NzUploadModule,
    NzButtonModule,
  ],
  templateUrl: './avance.component.html',
  styles: ``,
  providers: []
})
export class AvanceComponent {
  avanceForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';

  private fb = inject(UntypedFormBuilder);
  public hitosService = inject(HitosService);
  public acuerdosService = inject(AcuerdosService);
  public avancesService = inject(AvancesService);
  public sectoresStore = inject(SectoresStore);
  private utilesService = inject(UtilesService);
  private hitoSeleccionado = this.hitosService.hitoSeleccionado();
  private acuerdoSeleccionado = this.acuerdosService.acuerdoSeleccionado();
  avanceSeleccionado = this.avancesService.avanceSeleccionado();

  uploading = false;
  fileList: NzUploadFile[] = [];

  constructor() {
    this.crearAvanceForm();

    if (this.avanceSeleccionado != null && this.avanceSeleccionado.nombreEvidencia != '') {
      {
        this.fileList = [{
          uid: this.avanceSeleccionado.avanceId,
          name: this.avanceSeleccionado.nombreEvidencia,
          status: 'done',
          // url: 'server'
        }];
      }
    }

    if (this.hitoSeleccionado?.responsableSelect != null) {
      this.onResponsableIDChange(this.hitoSeleccionado.responsableSelect);
    }

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
        this.avanceForm.get('evidencia')?.patchValue(originalFile);
      }
    }

    return false; // Evita la carga automática del archivo
  };

  onDeleteFiles = (file: NzUploadFile): boolean => {
    this.fileList = [];
    this.avanceForm.get('evidencia')?.patchValue(null);
    this.avanceForm.get('nombreEvidencia')?.patchValue(null);
    console.log('evidencia', this.avanceForm.get('evidencia')?.value);

    return false;
  }

  handleDownload = (file: NzUploadFile): void => {
    const nombreEvidencia = this.avanceForm.get('nombreEvidencia')?.value;
    const idArchivo = this.avanceForm.get('avanceId')?.value;

    if (nombreEvidencia != '' && nombreEvidencia != null) { // viene del servidor
      this.avancesService.descargarEvidenciaAvance(idArchivo).then((res) => {
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

  onEntidadIDChange(id: number): void {
    if (id == null) return;
    console.log(id);
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onResponsableIDChange(tipo: SelectModel): void {
    const acuerdoId = this.acuerdoSeleccionado?.acuerdoId;
    if (tipo == null || acuerdoId == null) return;
    this.sectoresStore.listarEntidadesResponsables(Number(tipo.value), acuerdoId);
  }

  onEstadoChange(estado: string): void {
    if (estado == null) return;

    const controlNombreEvidencia = this.avanceForm.get('nombreEvidencia');

    if (estado == '1') {
      controlNombreEvidencia?.setValidators([Validators.required]);
    } else {
      controlNombreEvidencia?.clearValidators();
    }

    controlNombreEvidencia?.updateValueAndValidity();
  }

  crearAvanceForm(): void {
    this.avanceForm = this.fb.group({
      idEvidencia: [this.avanceSeleccionado?.idEvidencia],
      avanceId: [this.avanceSeleccionado?.avanceId],
      hitdoId: [this.hitoSeleccionado?.hitoId, [Validators.required]],
      fecha: [this.avanceSeleccionado?.fechaDate, [Validators.required]],
      avance: [this.avanceSeleccionado?.avance, [Validators.required]],
      evidencia: [this.avanceSeleccionado?.evidencia],
      estado: [this.avanceSeleccionado?.estado, [Validators.required]],
      nombreEvidencia: [this.avanceSeleccionado?.nombreEvidencia],
      // entidadSelect: [this.avanceSeleccionado?.entidadSelect, [Validators.required]],
      // responsableSelect: [this.hitoSeleccionado?.responsableSelect, [Validators.required]],
    });
  }
}
