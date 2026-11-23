import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Producto } from 'src/app/models/producto';

import { AuthService } from 'src/app/services/auth.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ModalService } from 'src/app/services/productos/modal.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styles: [
  ]
})
export class ProductosComponent implements OnInit, OnDestroy {

  title: string;
  productos: Producto[];

  public productoSeleccionado: Producto;

  // Estado de paginacion (los datos llegan ya paginados desde el backend)
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  search = '';
  cargando = false;

  private busqueda$ = new Subject<string>();
  private busquedaSub: Subscription;

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
   }

  ngOnInit(): void {
    this.getProductos();
    this.busquedaSub = this.busqueda$.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 0;
      this.getProductos();
    });
    this.modalService.notificarUpload.subscribe(producto => {
      this.productos = this.productos.map(productoOriginal => {
        if (producto.idProducto === productoOriginal.idProducto){
          productoOriginal.imagen = producto.imagen;
        }
        return productoOriginal;
      });
    });
  }

  ngOnDestroy(): void {
    this.busquedaSub?.unsubscribe();
  }

  getProductos(): void {
    this.cargando = true;
    this.productoService.getProductosPaginado(this.page, this.size, this.search).subscribe(
      response => {
        this.productos = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.page = response.number;
        this.cargando = false;
      },
      error => { this.cargando = false; }
    );
  }

  onBuscar(valor: string): void {
    this.search = valor;
    this.busqueda$.next(valor);
  }

  onPageChange(page: number): void {
    this.page = page;
    this.getProductos();
  }

  onSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.getProductos();
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
            // si se elimino el ultimo registro de la pagina, retrocede una pagina
            if (this.productos.length === 1 && this.page > 0) {
              this.page--;
            }
            this.getProductos();
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
