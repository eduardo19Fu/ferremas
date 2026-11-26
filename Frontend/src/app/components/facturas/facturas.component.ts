import { Component, OnInit, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { DetailService } from 'src/app/services/facturas/detail.service';
import { FacturaService } from 'src/app/services/facturas/factura.service';

import { Factura } from 'src/app/models/factura';
import { Usuario } from 'src/app/models/usuario';

import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import swal from 'sweetalert2';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent extends ListaPaginada<Factura> implements OnInit {

  title: string;
  fechaIni: Date;
  fechaFin: Date;
  private fechaAplicadaIni: Date;
  private fechaAplicadaFin: Date;

  usuario: Usuario;
  facturaSeleccionada: Factura;

  /** Ids de las facturas cuyo comprobante se esta generando (muestra el loading del boton). */
  imprimiendo = new Set<number>();

  private notificarAnulacion: EventEmitter<any>;

  swalWithBootstrapButtons = swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });

  constructor(
    private detailService: DetailService,
    private facturaService: FacturaService,
    public auth: AuthService
  ) {
    super();
    this.title = 'Facturas';
    this.usuario = auth.usuario;
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<Factura>> {
    return this.facturaService.getPaginado(page, size, search, this.fechaAplicadaIni, this.fechaAplicadaFin, sort);
  }

  get facturas(): Factura[] {
    return this.items;
  }

  ngOnInit(): void {
    this.cargar();
  }

  /** Exporta a Excel todas las facturas que coinciden con la busqueda, el rango de fechas aplicado y el orden actuales. */
  exportar(): void {
    const extra: { [clave: string]: string } = {};
    if (this.fechaAplicadaIni && this.fechaAplicadaFin) {
      extra.fechaIni = this.fechaAplicadaIni.toString();
      extra.fechaFin = this.fechaAplicadaFin.toString();
    }
    this.exportarExcel('facturas/exportar', 'facturas', extra);
  }

  getFacturasSP(): void {
    if (!this.fechaIni || !this.fechaFin) {
      swal.fire('Advertencia', 'Porfavor ingrese un rango de fechas valido.', 'warning');
      return;
    }
    // el filtro de fechas se aplica en el servidor junto con la paginacion
    this.fechaAplicadaIni = this.fechaIni;
    this.fechaAplicadaFin = this.fechaFin;
    this.page = 0;
    this.cargar();
  }

  reloadPage(): void {
    window.location.reload();
  }

  abrirDetalle(factura: Factura): void {
    this.facturaSeleccionada = factura;
    this.detailService.abrirModal();
  }

  cancel(factura: Factura): void {
    this.swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Seguro que desea anular la factura No. ${factura.noFactura}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Si, anular!',
      cancelButtonText: '¡No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {

        // aqui va el codigo de confirmación para anular factura
        this.facturaService.cancel(factura.idFactura, this.usuario.idUsuario).subscribe(
          response => {
            factura.estado = response.factura.estado;
            this.swalWithBootstrapButtons.fire(
              `${response.mensaje}`,
              `La factura No. ${factura.noFactura} ha sido anulada con éxito`,
              'success'
            );
          }
        );

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === swal.DismissReason.cancel
      ) {
        this.swalWithBootstrapButtons.fire(
          'Proceso Cancelado',
          `La factura No. ${factura.noFactura} no fué anulada.`,
          'error'
        );
      }
    });
  }

  printBill(factura: Factura): void {
    const id = factura.idFactura;

    /************ REGIMEN FEL *************/
    // const url = 'https://report.feel.com.gt/ingfacereport/ingfacereport_documento?uuid=' + factura.certificacionSat;
    // window.open(url, '_blank').focus();

    /************* FACTURA PDF ***************/

    if (this.imprimiendo.has(id)) {
      return;                                   // ya se esta generando este comprobante
    }
    this.imprimiendo.add(id);

    this.facturaService.getBillPDF(id).subscribe(res => {
      this.imprimiendo.delete(id);
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.setAttribute('target', 'blank');
      a.href = url;
      /*
        opcion para pedir descarga de la respuesta obtenida
        a.download = response.filename;
      */
      window.open(a.toString(), '_blank');
      window.URL.revokeObjectURL(url);
      a.remove();
    },
      error => {
        this.imprimiendo.delete(id);
        console.log(error);
        swal.fire('No se pudo generar el comprobante', 'Intente de nuevo en unos segundos.', 'error');
      });
  }
}
