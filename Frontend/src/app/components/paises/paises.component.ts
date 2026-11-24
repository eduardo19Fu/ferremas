import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Pais } from 'src/app/models/pais';
import { PaisService } from 'src/app/services/paises/pais.service';
import { AuthService } from '../../services/auth.service';
import { ModalPaisComponent, ResultadoPais } from './modal-pais/modal-pais.component';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-paises',
  templateUrl: './paises.component.html',
  styles: [
  ]
})
export class PaisesComponent extends ListaPaginada<Pais> implements OnInit {

  title: string;


  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });

  constructor(
    public auth: AuthService,
    private paisService: PaisService,
    private modalService: NgbModal
  ) {
    super();
    this.title = 'Listado de Paises Disponibles';
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<Pais>> {
    return this.paisService.getPaginado(page, size, search, sort);
  }

  get paises(): Pais[] {
    return this.items;
  }

  ngOnInit(): void {
    this.getPaises();
  }

  getPaises(): void {
    this.cargar();
  }

  /** Abre el modal para registrar un pais nuevo o, si se recibe uno, editarlo. */
  abrirModal(pais?: Pais): void {
    const modalRef = this.modalService.open(ModalPaisComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.id = pais ? pais.idPais : null;

    modalRef.result.then(
      (resultado: ResultadoPais) => {
        this.cargar();
        const nombre = resultado.response.pais.nombre;
        const detalle = resultado.edicion
          ? `Los datos de ${nombre} fueron actualizados.`
          : `El país ${nombre} fue registrado en la Base de Datos.`;
        Swal.fire(resultado.response.mensaje, detalle, 'success');
      },
      () => { /* modal cerrado sin guardar */ }
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
            this.recargarTrasEliminar();
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
