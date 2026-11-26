import { Component } from '@angular/core';

import { ReporteService } from '../../../../services/reportes/reporte.service';
import { hoyIso, ModalReporteBase, fechaIso } from '../modal-reporte-base';

/** Productos mas vendidos o de baja rotacion en un rango de fechas (PDF o Excel). */
@Component({
  selector: 'app-modal-rotacion-productos',
  templateUrl: './modal-rotacion-productos.component.html'
})
export class ModalRotacionProductosComponent extends ModalReporteBase {

  title = 'Rotación de Productos';

  modo: 'MAS_VENDIDOS' | 'BAJA_ROTACION' = 'MAS_VENDIDOS';
  fechaIni: string = fechaIso(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  fechaFin: string = hoyIso();
  limite = 20;
  orden: 'CANTIDAD' | 'IMPORTE' = 'CANTIDAD';
  umbral = 0;

  readonly limites = [10, 20, 50, 100, 200];

  constructor(reporteService: ReporteService) {
    super(reporteService);
  }

  get rangoValido(): boolean {
    return this.rango(this.fechaIni, this.fechaFin);
  }

  onSubmit(): void {
    if (!this.rangoValido) {
      return;
    }
    this.generar('rotacion-productos', {
      modo: this.modo,
      fechaIni: this.fechaIni,
      fechaFin: this.fechaFin,
      limite: this.limite,
      orden: this.orden,
      umbral: Math.max(0, Number(this.umbral) || 0)
    }, this.modo === 'MAS_VENDIDOS' ? 'productos_mas_vendidos' : 'productos_baja_rotacion');
  }
}
