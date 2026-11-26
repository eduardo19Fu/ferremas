import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';

import { Factura } from 'src/app/models/factura';
import { DetalleFacturaItem } from 'src/app/models/detalle-factura-item';
import { Page } from 'src/app/models/page';
import { DetailService } from 'src/app/services/facturas/detail.service';
import { FacturaService } from 'src/app/services/facturas/factura.service';
import { ListaPaginada } from 'src/app/utils/lista-paginada';

@Component({
  selector: 'app-detail-factura',
  templateUrl: './detail-factura.component.html',
  styleUrls: ['./detail-factura.component.css']
})
export class DetailFacturaComponent extends ListaPaginada<DetalleFacturaItem> implements OnChanges {

  title = 'Detalle de Factura';

  @Input() factura: Factura;

  /** Tamanos de pagina del detalle (pocos, para que el modal conserve una altura estable). */
  readonly tamanios = [5, 10, 20];

  constructor(
    public detailService: DetailService,
    private facturaService: FacturaService
  ) {
    super();
    this.size = 5;
  }

  /** Cada vez que se abre el modal con otra factura se reinicia el detalle y se pide su primera pagina. */
  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios.factura && this.factura?.idFactura) {
      this.items = [];
      this.totalElements = 0;
      this.totalPages = 0;
      this.page = 0;
      this.size = this.tamanios[0];
      this.sort = null;
      this.cargar();
    }
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<DetalleFacturaItem>> {
    return this.facturaService.getDetallePaginado(this.factura.idFactura, page, size, sort);
  }

  get anulada(): boolean {
    return this.factura?.estado?.idEstado === 4;
  }

  cerrarModal(): void {
    this.detailService.cerrarModal();
  }
}
