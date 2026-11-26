import { Component, OnInit } from '@angular/core';

import swal from 'sweetalert2';

import { Usuario } from '../../../../models/usuario';
import { ProformaService } from '../../../../services/proformas/proforma.service';
import { UsuarioService } from '../../../../services/usuarios/usuario.service';

/** Reporte de conversion de proformas a facturas, por vendedor, en un rango de fechas (PDF o Excel). */
@Component({
  selector: 'app-modal-conversion-proformas',
  templateUrl: './modal-conversion-proformas.component.html'
})
export class ModalConversionProformasComponent implements OnInit {

  title = 'Conversión de Proformas';

  fechaIni: string;
  fechaFin: string;
  idUsuario = 0;
  formato: 'PDF' | 'XLSX' = 'PDF';
  usuarios: Usuario[] = [];
  generando = false;

  constructor(
    private proformaService: ProformaService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.usuarioService.getUsuarios().subscribe(usuarios => this.usuarios = usuarios, () => this.usuarios = []);
  }

  get rangoValido(): boolean {
    return !!this.fechaIni && !!this.fechaFin && this.fechaFin >= this.fechaIni;
  }

  generar(): void {
    if (!this.rangoValido || this.generando) {
      return;
    }
    this.generando = true;

    const formato = this.formato;
    this.proformaService.getConversion(this.fechaIni, this.fechaFin, Number(this.idUsuario) || 0, formato).subscribe(
      archivo => {
        this.generando = false;
        const tipo = formato === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const url = window.URL.createObjectURL(new Blob([archivo], { type: tipo }));

        if (formato === 'PDF') {
          window.open(url, '_blank');
        } else {
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `conversion_proformas_${this.fechaIni}_${this.fechaFin}.xlsx`;
          document.body.appendChild(enlace);
          enlace.click();
          enlace.remove();
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      },
      () => {
        this.generando = false;
        swal.fire('No se pudo generar el reporte', 'Revise el rango de fechas e intente de nuevo.', 'error');
      }
    );
  }
}
