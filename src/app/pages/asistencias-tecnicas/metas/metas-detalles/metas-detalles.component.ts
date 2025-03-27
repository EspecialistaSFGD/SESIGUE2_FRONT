import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetaToDetails, MetaUsuarioResponse } from '@core/interfaces';
import { UsuarioMetasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-metas-detalles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule, PrimeNgModule],
  templateUrl: './metas-detalles.component.html',
  styles: ``
})
export class MetasDetallesComponent {

  loadingData: boolean = false
  showForm:  boolean = false

  usuarioMetas = signal<MetaUsuarioResponse[]>([])

  readonly meta: MetaToDetails = inject(NZ_MODAL_DATA);
  private usuarioMetasService = inject(UsuarioMetasService)
  private fb = inject(FormBuilder)

  formMeta: FormGroup = this.fb.group({
      metaId: ['', Validators.required],
      fecha: ['', Validators.required],
      meta: ['', Validators.required],
  })

  ngOnInit(): void {
    this.obtenerServicioMetas()
  }

  obtenerServicioMetas(){  
    this.usuarioMetasService.obtenerMetaUsuario(this.meta.usuarioId)
      .subscribe(resp => {
        this.usuarioMetas.set(resp.data)
    })
  }

  submitForm(meta: MetaUsuarioResponse){
    this.showForm = true
    this.formMeta.reset(meta)
    const controlFecha = this.formMeta.get('fecha')
    controlFecha?.disable()
  }

  enabledEdit(fecha: string){
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    
    return currentDate.getMonth() === fechaDate.getMonth() && currentDate.getFullYear() === fechaDate.getFullYear()
  }

  enabledNewMeta(){
    // const lastDate = this.metas[0].fecha
    // return this.enabledEdit(lastDate)
    return false
  }

  updateMeta(){
    const metaUsuario = ({...this.formMeta.value })    
    this.usuarioMetasService.updateMetaUsuario(metaUsuario)
      .subscribe(resp => {        
        this.obtenerServicioMetas()
      this.showForm = false
      })
  }
}
