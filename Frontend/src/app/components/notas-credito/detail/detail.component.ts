import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';

import { DetalleNotaCreditoItem } from '../../../models/detalle-nota-credito-item';
import { NotaCredito } from '../../../models/nota-credito';
import { Page } from '../../../models/page';
import { DetailService } from '../../../services/facturas/detail.service';
import { NotasCreditoService } from '../../../services/notas/notas-credito.service';
import { ListaPaginada } from '../../../utils/lista-paginada';

@Component({
  selector: 'app-detail-nota-credito',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailNotaCreditoComponent extends ListaPaginada<DetalleNotaCreditoItem> implements OnChanges {

  title = 'Detalle de Nota de Crédito';

  @Input() nota: NotaCredito;

  /** Tamanos de pagina del detalle (pocos, para que el modal conserve una altura acotada). */
  readonly tamanios = [5, 10, 20];

  constructor(
    public detailService: DetailService,
    private notasService: NotasCreditoService
  ) {
    super();
    this.size = 5;
  }

  /** Cada vez que se abre el modal con otra nota se reinicia el detalle y se pide su primera pagina. */
  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios.nota && this.nota?.idNotaCredito) {
      this.items = [];
      this.totalElements = 0;
      this.totalPages = 0;
      this.page = 0;
      this.size = this.tamanios[0];
      this.sort = null;
      this.cargar();
    }
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<DetalleNotaCreditoItem>> {
    return this.notasService.getDetallePaginado(this.nota.idNotaCredito, page, size, sort);
  }

  get anulada(): boolean {
    return this.nota?.estado?.idEstado === 4;
  }

  /** Porcentaje del total ya abonado (0-100), para la barra de avance del pago. */
  get avancePago(): number {
    const total = this.nota?.total || 0;
    return total > 0 ? Math.min(100, Math.round(((this.nota?.abono || 0) / total) * 100)) : 0;
  }

  cerrarModal(): void {
    this.detailService.cerrarModal();
  }
}
