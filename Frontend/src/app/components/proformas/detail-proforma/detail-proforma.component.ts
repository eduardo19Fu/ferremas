import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';

import { Page } from '../../../models/page';
import { DetalleProformaItem, ProformaResumen } from '../../../models/proforma-resumen';
import { DetailService } from '../../../services/facturas/detail.service';
import { ProformaService } from '../../../services/proformas/proforma.service';
import { ListaPaginada } from '../../../utils/lista-paginada';

@Component({
  selector: 'app-detail-proforma',
  templateUrl: './detail-proforma.component.html',
  styleUrls: ['./detail-proforma.component.css']
})
export class DetailProformaComponent extends ListaPaginada<DetalleProformaItem> implements OnChanges {

  title = 'Detalle de Proforma';

  @Input() proforma: ProformaResumen;

  /** Tamanos de pagina del detalle (pocos, para que el modal conserve una altura acotada). */
  readonly tamanios = [5, 10, 20];

  constructor(
    public detailService: DetailService,
    private proformaService: ProformaService
  ) {
    super();
    this.size = 5;
  }

  /** Cada vez que se abre el modal con otra proforma se reinicia el detalle y se pide su primera pagina. */
  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios.proforma && this.proforma?.idProforma) {
      this.items = [];
      this.totalElements = 0;
      this.totalPages = 0;
      this.page = 0;
      this.size = this.tamanios[0];
      this.sort = null;
      this.cargar();
    }
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<DetalleProformaItem>> {
    return this.proformaService.getDetallePaginado(this.proforma.idProforma, page, size, sort);
  }

  get facturada(): boolean {
    return !!this.proforma?.noFactura;
  }

  cerrarModal(): void {
    this.detailService.cerrarModal();
  }
}
