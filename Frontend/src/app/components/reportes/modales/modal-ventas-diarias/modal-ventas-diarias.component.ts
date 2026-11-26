import { Component, OnInit } from '@angular/core';

import swal from 'sweetalert2';

import { Usuario } from '../../../../models/usuario';
import { FacturaService } from '../../../../services/facturas/factura.service';
import { UsuarioService } from '../../../../services/usuarios/usuario.service';

/** Reporte de ventas diarias: facturas vigentes de un dia, de todos los vendedores o de uno (PDF o Excel). */
@Component({
  selector: 'app-modal-ventas-diarias',
  templateUrl: './modal-ventas-diarias.component.html'
})
export class ModalVentasDiariasComponent implements OnInit {

  title = 'Reporte de Ventas Diarias';

  fecha: string = ModalVentasDiariasComponent.hoy();
  idUsuario = 0;
  formato: 'PDF' | 'XLSX' = 'PDF';
  usuarios: Usuario[] = [];
  generando = false;

  /** Fecha local en formato yyyy-MM-dd (toISOString usaria UTC y puede dar el dia siguiente). */
  private static hoy(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  constructor(
    private facturaService: FacturaService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.usuarioService.getUsuarios().subscribe(usuarios => this.usuarios = usuarios, () => this.usuarios = []);
  }

  onSubmit(): void {
    if (!this.fecha || this.generando) {
      return;
    }
    this.generando = true;

    const formato = this.formato;
    this.facturaService.getVentasDiarias(this.fecha, Number(this.idUsuario) || 0, formato).subscribe(
      archivo => {
        this.generando = false;
        const tipo = formato === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const url = window.URL.createObjectURL(new Blob([archivo], { type: tipo }));

        if (formato === 'PDF') {
          window.open(url, '_blank');
        } else {
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `ventas_diarias_${this.fecha}.xlsx`;
          document.body.appendChild(enlace);
          enlace.click();
          enlace.remove();
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      },
      () => {
        this.generando = false;
        swal.fire('No se pudo generar el reporte', 'Revise la fecha e intente de nuevo.', 'error');
      }
    );
  }
}
