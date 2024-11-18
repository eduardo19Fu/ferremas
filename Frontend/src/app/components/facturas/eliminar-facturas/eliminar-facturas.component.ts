import { Component, OnInit } from '@angular/core';

import { FacturaService } from '../../../services/facturas/factura.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-eliminar-facturas',
  templateUrl: './eliminar-facturas.component.html',
  styleUrls: ['./eliminar-facturas.component.css']
})
export class EliminarFacturasComponent implements OnInit {

  title: string;
  startDate: Date;
  endDate: Date;

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });

  constructor(
    private facturaService: FacturaService
  ) {
    this.title = 'Eliminar Facturas';
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Seguro que desea eliminar las facturas en el rango de fechas seleccionado? Debe tomar en cuenta que ésta acción no puede ser deshecha.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Si, eliminar!',
      cancelButtonText: '¡No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {

        // aqui va el codigo de confirmación para anular factura
        this.facturaService.deletePorFecha(this.startDate, this.endDate).subscribe(
          response => {
            this.swalWithBootstrapButtons.fire(
              `¡Proceso Completado!`,
              `${response.mensaje}`,
              'success'
            ).then(() => {
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            });
          }
        );

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        this.swalWithBootstrapButtons.fire(
          'Proceso Cancelado',
          `Las facturas no fueron eliminadas.`,
          'error'
        );
      }
    });
  }

}
