import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from 'src/app/models/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { DetailUsuarioService } from 'src/app/services/usuarios/detail-usuario.service';
import { UsuarioService } from 'src/app/services/usuarios/usuario.service';

import swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styles: [
  ]
})
export class UsuariosComponent extends ListaPaginada<Usuario> implements OnInit {

  title: string;
  usuarioSeleccionado: Usuario;

  swalWithBootstrapButtons = swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: true
  });

  constructor(
    private detailUsuarioService: DetailUsuarioService,
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {
    super();
    this.title = 'Listado de Usuarios';
  }

  protected fetch(page: number, size: number, search: string): Observable<Page<Usuario>> {
    return this.usuarioService.getPaginado(page, size, search);
  }

  get usuarios(): Usuario[] {
    return this.items;
  }

  ngOnInit(): void {
    this.getUsuarios();
  }

  getUsuarios(): void {
    this.cargar();
  }

  delete(usuario: Usuario): void {
    this.swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Seguro que desea eliminar el usuario ${usuario.usuario}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Si, eliminar!',
      cancelButtonText: '¡No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {

        // tslint:disable-next-line: deprecation
        this.usuarioService.delete(usuario.idUsuario).subscribe(
          response => {
            if (this.authService.usuario.idUsuario === usuario.idUsuario) {
              this.authService.logout();
            } else {
              this.recargarTrasEliminar();
              this.swalWithBootstrapButtons.fire(
                '¡Usuario eliminado con éxito!',
                'El registro ha sido eliminado con éxito!',
                'success'
              );
            }
          }
        );
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === swal.DismissReason.cancel
      ) {
        this.swalWithBootstrapButtons.fire(
          'Proceso Cancelado',
          'El registro no fué eliminado de la base de datos.',
          'error'
        );
      }
    });
  }

  abrirDetalle(usuario: Usuario): void{
    this.usuarioSeleccionado = usuario;
    this.detailUsuarioService.abrirModal();
  }

}
