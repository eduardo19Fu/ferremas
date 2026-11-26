import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ProductoService } from '../../../../services/producto.service';
import { Producto } from '../../../../models/producto';

@Component({
  selector: 'app-modal-buscar-producto',
  templateUrl: './modal-buscar-producto.component.html',
  styles: [
  ]
})
export class ModalBuscarProductoComponent extends ListaPaginada<Producto> implements OnInit {

  @Output() producto = new EventEmitter<Producto>();

  title: string;

  constructor(
    private productoService: ProductoService
  ) {
    super();
    this.title = 'Búsqueda de Productos';
  }

  protected fetch(page: number, size: number, search: string): Observable<Page<Producto>> {
    return this.productoService.getProductosPaginado(page, size, search, true);
  }

  get productos(): Producto[] {
    return this.items;
  }

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void{
    this.cargar();
  }

  chooseProducto(producto: Producto): void{
    this.producto.emit(producto);
  }

}
