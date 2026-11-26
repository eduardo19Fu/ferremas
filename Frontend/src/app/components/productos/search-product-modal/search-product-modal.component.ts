import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';
import { Producto } from 'src/app/models/producto';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'app-search-product-modal',
  templateUrl: './search-product-modal.component.html',
  styleUrls: ['./search-product-modal.component.css']
})
export class SearchProductModalComponent extends ListaPaginada<Producto> implements OnInit {

  title: string;

  constructor(
    private productoService: ProductoService
  ) {
    super();
    this.title = 'Listado de Productos';
  }

  protected fetch(page: number, size: number, search: string): Observable<Page<Producto>> {
    return this.productoService.getProductosPaginado(page, size, search);
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

}
