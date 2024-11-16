import { AfterViewInit, Component, OnInit } from '@angular/core';

import { Producto } from 'src/app/models/producto';

import { AuthService } from 'src/app/services/auth.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ModalService } from 'src/app/services/productos/modal.service';
import { JqueryConfigs } from '../../utils/jquery/jquery-utils';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styles: [
  ]
})
export class ProductosComponent implements OnInit, AfterViewInit {

  title: string;
  productos: Producto[];

  public productoSeleccionado: Producto;

  paginador: any;

  jQueryConfigs: JqueryConfigs;

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });

  constructor(
    public modalService: ModalService,
    private productoService: ProductoService,
    public auth: AuthService
  ) {
    this.title = 'Listado de Productos';
    this.jQueryConfigs = new JqueryConfigs();
   }

  ngOnInit(): void {
    this.getProductos();
    this.modalService.notificarUpload.subscribe(producto => {
      this.productos = this.productos.map(productoOriginal => {
        if (producto.idProducto === productoOriginal.idProducto){
          productoOriginal.imagen = producto.imagen;
        }
        return productoOriginal;
      });
    });
  }

  ngAfterViewInit(): void{
  }

  getProductos(): void{
    this.productoService.getProductos().subscribe(
      productos => {
        this.productos = productos;
        this.jQueryConfigs.configDataTable('productos');
        this.jQueryConfigs.configToolTip();
      },
      error => { }
    );
  }

  abrirModal(producto: Producto): void{
    this.productoSeleccionado = producto;
    this.modalService.abrirModal();
  }

  deleteProducto(producto: Producto): void {
    this.swalWithBootstrapButtons.fire({
      title: '¿Estás seguro?',
      text: '¿Seguro que desea eliminar el producto? No podrá deshacer el cambio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Si, eliminar!',
      cancelButtonText: '¡No, cancelar!',
      reverseButtons: true
    }).then(result => {
      if(result.isConfirmed) {
        this.productoService.delete(producto.idProducto).subscribe(
          response => {
            this.productos = this.productos.filter(pro => pro !== producto);
            this.swalWithBootstrapButtons.fire(
              'Producto Eliminado',
              'El producto fué eliminado exitosamente.  Recuerde que el cambio no podrá ser revertido.',
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
