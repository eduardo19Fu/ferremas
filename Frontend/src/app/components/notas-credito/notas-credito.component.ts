import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DetailService } from 'src/app/services/facturas/detail.service';
import { NotaCredito } from '../../models/nota-credito';
import { NotasCreditoService } from '../../services/notas/notas-credito.service';

import swal from 'sweetalert2';

@Component({
  selector: 'app-notas-credito',
  templateUrl: './notas-credito.component.html',
  styles: [
  ]
})
export class NotasCreditoComponent extends ListaPaginada<NotaCredito> implements OnInit {

  title: string;

  /** Nota cuyo detalle se muestra en el modal. */
  notaSeleccionada: NotaCredito;

  constructor(
    private notasService: NotasCreditoService,
    public auth: AuthService,
    public detailService: DetailService
  ) {
    super();
    this.title = 'Notas de Crédito';
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<NotaCredito>> {
    return this.notasService.getPaginado(page, size, search, false, sort);
  }

  get notasCredito(): NotaCredito[] {
    return this.items;
  }

  ngOnInit(): void {
    this.loadNotasCredito();
  }

  /** Ids de las notas que se estan anulando (bloquea el boton y muestra el loading). */
  anulando = new Set<number>();

  /** Una nota solo puede anularse mientras esta activa (estado 1). */
  puedeAnularse(nota: NotaCredito): boolean {
    return nota.estado?.idEstado === 1 && !this.anulando.has(nota.idNotaCredito);
  }

  cancel(nota: NotaCredito): void {
    if (!this.puedeAnularse(nota)) {
      return;
    }

    swal.fire({
      title: '¿Anular la nota de crédito?',
      html: `Se anulará la nota <b>No. ${nota.idNotaCredito}</b> y los productos regresarán al inventario.<br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true,
      focusCancel: true,
      customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-secondary' },
      buttonsStyling: false
    }).then(resultado => {
      if (!resultado.isConfirmed) {
        return;
      }

      this.anulando.add(nota.idNotaCredito);
      this.notasService.anular(nota.idNotaCredito).subscribe(
        respuesta => {
          this.anulando.delete(nota.idNotaCredito);
          nota.estado = respuesta.notaCredito.estado;
          swal.fire('Nota anulada', `La nota de crédito No. ${nota.idNotaCredito} fue anulada y sus productos volvieron al inventario.`, 'success');
        },
        () => this.anulando.delete(nota.idNotaCredito)      // el servicio ya muestra el motivo del rechazo
      );
    });
  }

  abrirDetalle(nota: NotaCredito): void {
    this.notaSeleccionada = nota;
    this.detailService.abrirModal();
  }

  loadNotasCredito(): void {
    this.cargar();
  }

}
