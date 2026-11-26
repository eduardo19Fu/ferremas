import { Component, OnInit } from '@angular/core';

import swal from 'sweetalert2';

import { Usuario } from '../../../../models/usuario';
import { FacturaService } from '../../../../services/facturas/factura.service';
import { UsuarioService } from '../../../../services/usuarios/usuario.service';

/** Reporte de ventas por mes de un anio, de todos los vendedores o de uno (PDF o Excel). */
@Component({
  selector: 'app-modal-ventas-mensuales',
  templateUrl: './modal-ventas-mensuales.component.html'
})
export class ModalVentasMensualesComponent implements OnInit {

  title = 'Reporte de Ventas Mensuales';

  readonly anioActual = new Date().getFullYear();
  /** Del anio en curso hacia atras (el sistema no tiene facturas anteriores a 2000). */
  readonly anios: number[] = Array.from({ length: 10 }, (_, i) => this.anioActual - i);

  anio = this.anioActual;
  idUsuario = 0;
  formato: 'PDF' | 'XLSX' = 'PDF';
  usuarios: Usuario[] = [];
  generando = false;

  constructor(
    private facturaService: FacturaService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.usuarioService.getUsuarios().subscribe(usuarios => this.usuarios = usuarios, () => this.usuarios = []);
  }

  onSubmit(): void {
    if (!this.anio || this.generando) {
      return;
    }
    this.generando = true;

    const formato = this.formato;
    const anio = Number(this.anio);
    this.facturaService.getVentasMensuales(anio, Number(this.idUsuario) || 0, formato).subscribe(
      archivo => {
        this.generando = false;
        const tipo = formato === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const url = window.URL.createObjectURL(new Blob([archivo], { type: tipo }));

        if (formato === 'PDF') {
          window.open(url, '_blank');
        } else {
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `ventas_mensuales_${anio}.xlsx`;
          document.body.appendChild(enlace);
          enlace.click();
          enlace.remove();
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      },
      () => {
        this.generando = false;
        swal.fire('No se pudo generar el reporte', 'Revise el año e intente de nuevo.', 'error');
      }
    );
  }
}
