import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetaToDetails } from '@core/interfaces/meta.interface';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

interface MetasResp {
  fecha: Date,
  meta: number
}

@Component({
  selector: 'app-metas-detalles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule],
  templateUrl: './metas-detalles.component.html',
  styles: ``
})
export class MetasDetallesComponent {

  loadingData: boolean = false
  metas: MetasResp[] = []
  showForm:  boolean = false

  readonly meta: MetaToDetails = inject(NZ_MODAL_DATA);
  private fb = inject(FormBuilder)

  public formMeta: FormGroup = this.fb.group({
      fecha: ['', Validators.required],
      meta: ['', Validators.required],
  })

  ngOnInit(): void {
    this.generateDate()
  }

  generateDate(){
    const metas:number[] =  [32,15, 20, 25, 32, 30]
    const fechas: string[] = ['03/01/2025', '02/01/2025', '01/01/2025', '12/01/2024', '11/01/2024', '10/01/202']
    // const fechas: string[] = ['02/01/2025', '01/01/2025', '12/01/2024', '11/01/2024', '10/01/202']
    let i = 0
    for(let fecha of fechas){
      const metaDate = new Date(fecha);
      this.metas.push({ fecha: metaDate, meta: metas[i] })
      i ++
    }
  }

  enabledEdit(fecha: Date){
    const currentDate = new Date();
    return !(currentDate.getMonth() === fecha.getMonth() && currentDate.getFullYear() === fecha.getFullYear());
  }

  enabledNewMeta(){
    const lastDate = this.metas[0].fecha
    // this.enabledEdit(lastDate)
    return this.enabledEdit(lastDate)
  }
}
