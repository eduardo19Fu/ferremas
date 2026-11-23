import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { TipoProductoService } from 'src/app/services/tipo-producto.service';

import { TipoProducto } from 'src/app/models/tipo-producto';

import swal from 'sweetalert2';

@Component({
  selector: 'app-tipos-producto',
  templateUrl: './tipos-producto.component.html',
  styles: [
  ]
})
export class TiposProductoComponent extends ListaPaginada<TipoProducto> implements OnInit {

  title: string;

  swalWithBootstrapButtons = swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });

  constructor(
    private tipoService: TipoProductoService,
    public auth: AuthService
  ) {
    super();
    this.title = 'Listado de Categorías';
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<TipoProducto>> {
    return this.tipoService.getPaginado(page, size, search, sort);
  }

  get tipos(): TipoProducto[] {
    return this.items;
  }

  ngOnInit(): void {
    this.getTipos();
  }

  // listado de tipos normal
  getTipos(): void {
    // tslint:disable-next-line: deprecation
    this.cargar();
  }

  delete(tipoProducto: TipoProducto): void {
    this.swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Seguro que desea eliminar ${tipoProducto.tipoProducto}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Si, eliminar!',
      cancelButtonText: '¡No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {

        // tslint:disable-next-line: deprecation
        this.tipoService.delete(tipoProducto.idTipoProducto).subscribe(
          response => {
            this.recargarTrasEliminar();
            this.swalWithBootstrapButtons.fire(
              '¡Tipo Producto Eliminado!',
              'El registro ha sido eliminado con éxito!',
              'success'
            );
          }
        );
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === swal.DismissReason.cancel
      ) {
        this.swalWithBootstrapButtons.fire(
          'Proceso Cancelado',
          'El registro no fué eliminado de la base de datos.',
          'error'
        );
      }
    });
  }

}
