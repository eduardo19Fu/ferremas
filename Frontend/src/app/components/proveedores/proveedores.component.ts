import { Component, OnInit } from '@angular/core';

import { Proveedor } from 'src/app/models/proveedor';
import { ProveedorService } from 'src/app/services/proveedores/proveedor.service';
import { AuthService } from '../../services/auth.service';

import { JqueryConfigs } from '../../utils/jquery/jquery-utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styles: [
  ]
})
export class ProveedoresComponent implements OnInit {

  title: string;

  jqueryConfigs: JqueryConfigs = new JqueryConfigs();

  proveedores: Proveedor[];

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
    this.title = 'Listado de Proveedores';
  }

  ngOnInit(): void {
    this.getProveedores();
  }

  getProveedores(): void {
    this.proveedorService.getProveedores().subscribe(
      proveedores => {
        this.proveedores = proveedores;
        this.jqueryConfigs.configDataTable('proveedores');
      }
    );
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
            this.proveedores = this.proveedores.filter(pro => pro !== proveedor);
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
