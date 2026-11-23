import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';

import { Proveedor } from 'src/app/models/proveedor';
import { ProveedorService } from 'src/app/services/proveedores/proveedor.service';
import { AuthService } from '../../services/auth.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styles: [
  ]
})
export class ProveedoresComponent extends ListaPaginada<Proveedor> implements OnInit {

  title: string;


  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });


  constructor
  (
    public auth: AuthService,
    private proveedorService: ProveedorService
  ) 
  {
    super();
    this.title = 'Listado de Proveedores';
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<Proveedor>> {
    return this.proveedorService.getPaginado(page, size, search, sort);
  }

  get proveedores(): Proveedor[] {
    return this.items;
  }

  ngOnInit(): void {
    this.getProveedores();
  }

  getProveedores(): void {
    this.cargar();
  }

  delete(proveedor: Proveedor): void {
    this.swalWithBootstrapButtons.fire({
      title: '¿Estás seguro?',
      text: '¿Seguro que desea eliminar el proveedor? No podrá deshacer el cambio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Si, eliminar!',
      cancelButtonText: '¡No, cancelar!',
      reverseButtons: true
    }).then(result => {
      if(result.isConfirmed) {
        this.proveedorService.delete(proveedor.idProveedor).subscribe(
          response => {
            this.recargarTrasEliminar();
            this.swalWithBootstrapButtons.fire(
              'Proveedor Eliminado',
              'El proveedor fué eliminado exitosamente. Recuerde que el cambio no podrá ser revertido.',
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

}
