import { Component, OnInit } from '@angular/core';

import { Pais } from 'src/app/models/pais';
import { PaisService } from 'src/app/services/paises/pais.service';
import { AuthService } from '../../services/auth.service';

import { JqueryConfigs } from '../../utils/jquery/jquery-utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paises',
  templateUrl: './paises.component.html',
  styles: [
  ]
})
export class PaisesComponent implements OnInit {

  title: string;
  jqueryConfigs: JqueryConfigs;

  paises: Pais[];

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });

  constructor(
    public auth: AuthService,
    private paisService: PaisService
  ) {
    this.title = 'Listado de Paises Disponibles';
    this.jqueryConfigs = new JqueryConfigs();
  }

  ngOnInit(): void {
    this.getPaises();
  }

  getPaises(): void {
    this.paisService.getPaises().subscribe(
      paises => {
        this.paises = paises;
        this.jqueryConfigs.configDataTable('paises');
      }
    );
  }

  delete(pais: Pais): void {
    this.swalWithBootstrapButtons.fire({
      title: '¿Estás seguro?',
      text: '¿Seguro que desea eliminar el país? No podrá deshacer el cambio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Si, eliminar!',
      cancelButtonText: '¡No, cancelar!',
      reverseButtons: true
    }).then(result => {
      if(result.isConfirmed) {
        this.paisService.delete(pais.idPais).subscribe(
          response => {
            this.paises = this.paises.filter(p => p !== pais);
            this.swalWithBootstrapButtons.fire(
              'País Eliminado',
              'El país fué eliminado exitosamente. Recuerde que el cambio no podrá ser revertido.',
              'success'
            );
          }, error => {
            this.swalWithBootstrapButtons.fire(
              'Ha Ocurrido un Problema',
              'El error ocurrido corresponde a: ' + error.error.error,
              'error'
            );
          }
        );
      } else if(result.dismiss === Swal.DismissReason.cancel) {
        this.swalWithBootstrapButtons.fire(
          'Proceso Cancelado',
          'El registro no fue eliminado de la base de datos.',
          'error'
        );
      }
    });
  }

}
