import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';

import { Compra } from '../../../models/compra';
import { DetalleCompraItem } from '../../../models/detalle-compra-item';
import { Page } from '../../../models/page';
import { CompraService } from '../../../services/compras/compra.service';
import { DetailService } from '../../../services/facturas/detail.service';
import { ListaPaginada } from '../../../utils/lista-paginada';

@Component({
  selector: 'app-modal-detalle-compra',
  templateUrl: './modal-detalle-compra.component.html',
  styleUrls: ['./modal-detalle-compra.component.css']
})
export class ModalDetalleCompraComponent extends ListaPaginada<DetalleCompraItem> implements OnChanges {

  title = 'Detalle de Compra';

  @Input() compra: Compra;

  /** Tamanos de pagina del detalle (pocos, para que el modal conserve una altura acotada). */
  readonly tamanios = [5, 10, 20];

  constructor(
    public detailService: DetailService,
    private compraService: CompraService
  ) {
    super();
    this.size = 5;
  }

  /** Cada vez que se abre el modal con otra compra se reinicia el detalle y se pide su primera pagina. */
  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios.compra && this.compra?.idCompra) {
      this.items = [];
      this.totalElements = 0;
      this.totalPages = 0;
      this.page = 0;
      this.size = this.tamanios[0];
      this.sort = null;
      this.cargar();
    }
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<DetalleCompraItem>> {
    return this.compraService.getDetallePaginado(this.compra.idCompra, page, size, sort);
  }

  get anulada(): boolean {
    return this.compra?.estado?.estado === 'ANULADO';
  }

  cerrarModal(): void {
    this.detailService.cerrarModal();
  }
}
