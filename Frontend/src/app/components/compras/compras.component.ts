import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';

import { Compra } from '../../models/compra';
import { CompraService } from 'src/app/services/compras/compra.service';
import { AuthService } from '../../services/auth.service';
import { DetailService } from '../../services/facturas/detail.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styles: [
  ]
})
export class ComprasComponent extends ListaPaginada<Compra> implements OnInit {

  title: string;

  compraSeleccionada: Compra;


  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });

  constructor(
    private compraService: CompraService,
    public authService: AuthService,
    public detailService: DetailService
  ) {
    super();
    this.title = 'Compras Realizadas';
  }

  protected fetch(page: number, size: number, search: string): Observable<Page<Compra>> {
    return this.compraService.getPaginado(page, size, search);
  }

  get compras(): Compra[] {
    return this.items;
  }

  ngOnInit(): void {
    this.getCompras();
  }

  /**
   * Función que realiza la petición al backend para recuperar el listado de compras realizadas.
   * 
   */
  getCompras(): void {
    this.cargar();
  }

  anularCompra(): void { 
    // TODO
  }

  delete(compra: Compra): void {
    this.swalWithBootstrapButtons.fire({
      title: '¿Estás seguro?',
      text: '¿Seguro que desea eliminar la compra? No podrá deshacer el cambio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Si, eliminar!',
      cancelButtonText: '¡No, cancelar!',
      reverseButtons: true
    }).then(result => {
      if(result.isConfirmed) {
        this.compraService.delete(compra.idCompra).subscribe(
          response => {
            this.recargarTrasEliminar();
            this.swalWithBootstrapButtons.fire(
              'Compra Eliminada',
              'La compra fué eliminada exitosamente.  Recuerde que el cambio no podrá ser revertido.',
              'success'
            );
          }, error => {
            this.swalWithBootstrapButtons.fire(
              'Ha Ocurrido un Problema', 
              'El error ocurrido corresponde a: ' + error.error.error,
              'error'
            );  
          }
        );
      } else if(result.dismiss === Swal.DismissReason.cancel) {
        this.swalWithBootstrapButtons.fire(
          'Proceso Cancelado',
          'El registro no fue eliminado de la base de datos.',
          'error'
        );
      }
    });
  }

  abrirDetalle(compra: Compra): void {
    this.compraSeleccionada = compra;
    this.detailService.abrirModal();
  }

}
