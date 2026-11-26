import { Component } from '@angular/core';

import { ReporteService } from '../../../../services/reportes/reporte.service';
import { hoyIso, ModalReporteBase, primerDiaDelMesIso } from '../modal-reporte-base';

/** Facturas, notas de credito y compras anuladas en un rango de fechas (PDF o Excel). */
@Component({
  selector: 'app-modal-anulaciones',
  templateUrl: './modal-anulaciones.component.html'
})
export class ModalAnulacionesComponent extends ModalReporteBase {

  title = 'Documentos Anulados';

  fechaIni: string = primerDiaDelMesIso();
  fechaFin: string = hoyIso();

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
    this.generar('anulaciones', { fechaIni: this.fechaIni, fechaFin: this.fechaFin }, 'anulaciones');
  }
}
