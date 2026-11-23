import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarcaProducto } from 'src/app/models/marca-producto';
import { AuthService } from 'src/app/services/auth.service';
import { MarcaProductoService } from 'src/app/services/marca-producto.service';

import swal from 'sweetalert2';

@Component({
  selector: 'app-marcas-producto',
  templateUrl: './marcas-producto.component.html',
  styles: [
  ]
})
export class MarcasProductoComponent extends ListaPaginada<MarcaProducto> implements OnInit {

  title: string;

  swalWithBootstrapButtons = swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });

  constructor(
    private marcaService: MarcaProductoService,
    private activatedRoute: ActivatedRoute,
    public auth: AuthService
  ) {
    super();
    this.title = 'Listado de Marcas de Productos';
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<MarcaProducto>> {
    return this.marcaService.getPaginado(page, size, search, sort);
  }

  get marcas(): MarcaProducto[] {
    return this.items;
  }

  ngOnInit(): void {
    this.getMarcas();
  }

  getMarcas(): void{
    this.cargar();
  }

  delete(marcaProducto: MarcaProducto): void{
    this.swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Seguro que desea eliminar ${marcaProducto.marca}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Si, eliminar!',
      cancelButtonText: '¡No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {

        // tslint:disable-next-line: deprecation
        this.marcaService.delete(marcaProducto.idMarcaProducto).subscribe(
          response => {
            this.recargarTrasEliminar();
            this.swalWithBootstrapButtons.fire(
              '¡Marca Eliminada!',
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
