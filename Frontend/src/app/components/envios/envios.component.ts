import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';

import { Envio } from 'src/app/models/envio';
import { AuthService } from 'src/app/services/auth.service';
import { EnvioService } from 'src/app/services/envios/envio.service';
import { DetailService } from 'src/app/services/facturas/detail.service';

import Swal from 'sweetalert2';
import { Estado } from '../../models/estado';

@Component({
  selector: 'app-envios',
  templateUrl: './envios.component.html',
  styles: [
  ]
})
export class EnviosComponent extends ListaPaginada<Envio> implements OnInit {

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });

  title: string;
  envioSeleccionado: Envio;


  constructor(
    private envioService: EnvioService,
    public auth: AuthService,
    public detailService: DetailService
  ) {
    super();
    this.title = 'Listado de Envios';
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<Envio>> {
    return this.envioService.getPaginado(page, size, search, sort);
  }

  get envios(): Envio[] {
    return this.items;
  }

  ngOnInit(): void {
    this.getEnvios();
  }

  getEnvios(): void {
    this.cargar();
  }

  despachar(envio: Envio): void {
    this.swalWithBootstrapButtons.fire({
      title: '¿Seguro de despachar el Pedido?',
      text: "¡No podrá deshacer esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, despachar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then((result) => {

      if (result.isConfirmed) {
        
        this.envioService.dispatch(envio).subscribe(response => {
          envio.estados = response.envio.estados;
          Swal.fire(response.mensaje, `El envío ha sido despachado con éxito.`, 'success');
        });

      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        this.swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your imaginary file is safe :)',
          'error'
        )
      }
    });
  }

  /**
   * Función que determina si en el listado de envíos se encuentran los estados de "Despachado" para determinar
   * si se deshabilita la opción de Despachar en las opciones disponibles.
   * @param estados Es el Array de estados disponibles en el envío en turno de todos los envíos.
   * @returns Devuelve verdadero en caso de encontrar el valor de 'DESPACHADO' entre el listado de estados.
   */
  despachado(estados: Estado[]): boolean {
    let estado: Estado;
    estado = estados.find(estado => estado.estado === 'despachado'.toUpperCase());
    return estados.includes(estado);
  }

  abrirDetalle(envio: Envio): void {
    this.envioSeleccionado = envio;
    this.detailService.abrirModal();
  }

  print(envio: Envio): void {
    this.envioService.getEnvioPdf(envio.idEnvio).subscribe(response => {
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.setAttribute('target', 'blank');
      a.href = url;

      window.open(a.toString(), '_blank');
      window.URL.revokeObjectURL(url);
      a.remove();
    },
      error => {
        console.log(error);
    });
  }

}
