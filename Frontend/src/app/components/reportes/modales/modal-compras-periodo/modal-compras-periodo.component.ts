import { Component, OnInit } from '@angular/core';

import { Proveedor } from '../../../../models/proveedor';
import { ProveedorService } from '../../../../services/proveedores/proveedor.service';
import { ReporteService } from '../../../../services/reportes/reporte.service';
import { hoyIso, ModalReporteBase, primerDiaDelMesIso } from '../modal-reporte-base';

/** Compras vigentes de un rango, agrupadas por proveedor (PDF o Excel). */
@Component({
  selector: 'app-modal-compras-periodo',
  templateUrl: './modal-compras-periodo.component.html'
})
export class ModalComprasPeriodoComponent extends ModalReporteBase implements OnInit {

  title = 'Reporte de Compras';

  fechaIni: string = primerDiaDelMesIso();
  fechaFin: string = hoyIso();
  idProveedor = 0;
  proveedores: Proveedor[] = [];

  constructor(reporteService: ReporteService, private proveedorService: ProveedorService) {
    super(reporteService);
  }

  ngOnInit(): void {
    this.proveedorService.getProveedores().subscribe(proveedores => this.proveedores = proveedores, () => this.proveedores = []);
  }

  get rangoValido(): boolean {
    return this.rango(this.fechaIni, this.fechaFin);
  }

  onSubmit(): void {
    if (!this.rangoValido) {
      return;
    }
    this.generar('compras', {
      fechaIni: this.fechaIni,
      fechaFin: this.fechaFin,
      idProveedor: Number(this.idProveedor) || 0
    }, 'compras');
  }
}
