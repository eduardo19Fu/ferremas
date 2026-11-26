import { Component } from '@angular/core';

import swal from 'sweetalert2';

import { ProductoService } from '../../../../services/producto.service';

/** Inventario valorizado (PDF) con las entradas y salidas del dia elegido. */
@Component({
  selector: 'app-modal-productos-inventario',
  templateUrl: './modal-productos-inventario.component.html',
  styleUrls: ['./modal-productos-inventario.component.css']
})
export class ModalProductosInventarioComponent {

  title = 'Reporte de Inventario';
  fecha: string = ModalProductosInventarioComponent.hoy();
  generando = false;

  /** Fecha local en formato yyyy-MM-dd (toISOString usaria UTC y puede dar el dia siguiente). */
  private static hoy(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  constructor(private productoService: ProductoService) { }

  onSubmit(): void {
    if (!this.fecha || this.generando) {
      return;
    }
    this.generando = true;

    this.productoService.printInventarioReport(this.fecha).subscribe(
      archivo => {
        this.generando = false;
        const url = window.URL.createObjectURL(new Blob([archivo], { type: 'application/pdf' }));
        window.open(url, '_blank');
        // Se libera tarde para que la pestana nueva alcance a cargar el PDF.
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      },
      () => {
        this.generando = false;
        swal.fire('No se pudo generar el inventario', 'Revise la fecha e intente de nuevo.', 'error');
      }
    );
  }
}
