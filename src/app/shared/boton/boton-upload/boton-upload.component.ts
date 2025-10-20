import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { getNameImage, getSizeImage } from '@core/helpers';
import { DataFile } from '@core/interfaces';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-boton-upload',
  standalone: true,
  imports: [CommonModule, PrimeNgModule],
  templateUrl: './boton-upload.component.html',
  styles: ``
})
export class BotonUploadComponent implements OnChanges {
  // @Input() control!: FormControl
  @Input() titleBoton: string = 'Seleccionar archivo'
  @Input() accept:string = 'image/*'
  @Input() name:string = 'file'
  @Input() resetFile:boolean = false

  @Output() files = new EventEmitter<DataFile>()

  // controlFile!: HTMLInputElement
  nameFile: string = ''
  sizeFile: string = ''
  loaded: boolean = false

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetFile'] && changes['resetFile'].currentValue) {
      this.clearImage();
    }
  }

  previewImage(event: any) {
    const control = event.target
    // this.controlFile = control

    const [file] = control.files
    const dataFile: DataFile = { exist: true, file }

    this.sizeFile = getSizeImage(file.size)
    this.nameFile = getNameImage(file.name)

    this.files.emit(dataFile)
    this.loaded = true
  }

  clearImage() {
    const dataFile: DataFile = { exist: false }
    this.files.emit(dataFile)
    // this.controlFile.value = ''
    this.loaded = false
  }
}
