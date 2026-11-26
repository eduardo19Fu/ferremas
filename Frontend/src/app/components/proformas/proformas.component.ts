import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import swal from 'sweetalert2';

import { Page } from 'src/app/models/page';
import { ProformaResumen } from 'src/app/models/proforma-resumen';
import { Usuario } from 'src/app/models/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { DetailService } from 'src/app/services/facturas/detail.service';
import { ProformaService } from 'src/app/services/proformas/proforma.service';
import { UsuarioService } from 'src/app/services/usuarios/usuario.service';
import { ListaPaginada } from 'src/app/utils/lista-paginada';

@Component({
  selector: 'app-proformas',
  templateUrl: './proformas.component.html'
})
export class ProformasComponent extends ListaPaginada<ProformaResumen> implements OnInit {

  title = 'Proformas';

  // filtros (los "aplicados" son los que usa el listado; los otros son los del formulario)
  fechaIni: string;
  fechaFin: string;
  idUsuario = 0;
  usuarios: Usuario[] = [];
  private fechaAplicadaIni: string;
  private fechaAplicadaFin: string;
  private usuarioAplicado = 0;

  /** Proforma cuyo detalle se muestra en el modal. */
  proformaSeleccionada: ProformaResumen;

  /** Ids de las proformas cuyo PDF se esta generando (loading del boton). */
  imprimiendo = new Set<number>();

  constructor(
    private proformaService: ProformaService,
    private usuarioService: UsuarioService,
    private detailService: DetailService,
    public auth: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.cargar();
    if (this.auth.hasRole('ROLE_ADMIN')) {
      this.usuarioService.getUsuarios().subscribe(usuarios => this.usuarios = usuarios, () => this.usuarios = []);
    }
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<ProformaResumen>> {
    return this.proformaService.getPaginado(page, size, search, this.fechaAplicadaIni, this.fechaAplicadaFin, this.usuarioAplicado, sort);
  }

  get proformas(): ProformaResumen[] {
    return this.items;
  }

  // ------------------------------------------------------------------ filtros

  aplicarFiltros(): void {
    if ((this.fechaIni && !this.fechaFin) || (!this.fechaIni && this.fechaFin)) {
      swal.fire('Rango incompleto', 'Indique la fecha de inicio y la fecha final, o deje ambas vacías.', 'warning');
      return;
    }
    if (this.fechaIni && this.fechaFin && this.fechaFin < this.fechaIni) {
      swal.fire('Rango inválido', 'La fecha final no puede ser anterior a la fecha de inicio.', 'warning');
      return;
    }
    this.fechaAplicadaIni = this.fechaIni;
    this.fechaAplicadaFin = this.fechaFin;
    this.usuarioAplicado = Number(this.idUsuario) || 0;
    this.page = 0;
    this.cargar();
  }

  limpiarFiltros(): void {
    this.fechaIni = this.fechaFin = undefined;
    this.idUsuario = 0;
    this.aplicarFiltros();
  }

  get hayFiltros(): boolean {
    return !!(this.fechaAplicadaIni || this.usuarioAplicado);
  }

  // ------------------------------------------------------------------ acciones

  /** Exporta a Excel todas las proformas que coinciden con la busqueda y los filtros aplicados. */
  exportar(): void {
    const extra: { [clave: string]: string } = {};
    if (this.fechaAplicadaIni && this.fechaAplicadaFin) {
      extra.fechaIni = this.fechaAplicadaIni;
      extra.fechaFin = this.fechaAplicadaFin;
    }
    if (this.usuarioAplicado) {
      extra.idUsuario = String(this.usuarioAplicado);
    }
    this.exportarExcel('proformas/exportar', 'proformas', extra);
  }

  abrirDetalle(proforma: ProformaResumen): void {
    this.proformaSeleccionada = proforma;
    this.detailService.abrirModal();
  }

  imprimir(proforma: ProformaResumen): void {
    const id = proforma.idProforma;
    if (this.imprimiendo.has(id)) {
      return;
    }
    this.imprimiendo.add(id);

    this.proformaService.getPdf(id).subscribe(
      pdf => {
        this.imprimiendo.delete(id);
        const url = window.URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      },
      () => {
        this.imprimiendo.delete(id);
        swal.fire('No se pudo generar la proforma', 'Intente de nuevo en unos segundos.', 'error');
      }
    );
  }

  eliminar(proforma: ProformaResumen): void {
    swal.fire({
      title: '¿Eliminar la proforma?',
      html: `Se eliminará la proforma <b>No. ${proforma.noProforma}</b>.<br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true,
      focusCancel: true,
      customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-secondary' },
      buttonsStyling: false
    }).then(resultado => {
      if (!resultado.isConfirmed) {
        return;
      }
      this.proformaService.delete(proforma.idProforma).subscribe(() => {
        swal.fire('Proforma eliminada', `La proforma No. ${proforma.noProforma} fue eliminada.`, 'success');
        this.recargarTrasEliminar();
      });
    });
  }
}
