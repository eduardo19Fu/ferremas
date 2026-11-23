import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';

import { MovimientoProducto } from 'src/app/models/movimiento-producto';

import { AuthService } from 'src/app/services/auth.service';
import { MovimientosProductoService } from '../../services/movimientos/movimientos-producto.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-movimientos-producto',
  templateUrl: './movimientos-producto.component.html',
  styles: [
  ]
})
export class MovimientosProductoComponent extends ListaPaginada<MovimientoProducto> implements OnInit {

  title: string;

  constructor(
    private movimientosProductoService: MovimientosProductoService,
    public authService: AuthService
  ) {
    super();
    this.title = 'Movimientos de Productos Creados';
  }

  protected fetch(page: number, size: number, search: string): Observable<Page<MovimientoProducto>> {
    return this.movimientosProductoService.getPaginado(page, size, search);
  }

  get movimientosProducto(): MovimientoProducto[] {
    return this.items;
  }

  ngOnInit(): void {
    this.cargar();
  }

}
