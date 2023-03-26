import { Component, OnInit } from '@angular/core';

import { NotaCredito } from '../../../models/nota-credito';
import { PagoParcialService } from '../../../services/pago-parcial.service';

import Swal from 'sweetalert2';
import { PagoParcial } from '../../../models/pago-parcial';
import { Usuario } from '../../../models/usuario';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UsuarioAuxiliar } from '../../../models/auxiliar/usuario-auxiliar';
import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-create-pago-parcial',
  templateUrl: './create-pago-parcial.component.html',
  styles: [
  ]
})
export class CreatePagoParcialComponent implements OnInit {

  title: string;
  notaCredito: NotaCredito;
  pagoParcial: PagoParcial;
  cliente: Cliente;
  usuarioAuxiliar: UsuarioAuxiliar;

  constructor(
    private pagoParcialService: PagoParcialService,
    private router: Router,
    public authService: AuthService
  ) {
    this.title = 'Crear Pago Parcial';
    this.pagoParcial = new PagoParcial();
    this.notaCredito = new NotaCredito();
    this.cliente = new Cliente();
  }

  ngOnInit(): void {
  }

  cargarNotaCredito(event): void {
    (document.getElementById('buscar') as HTMLInputElement).value = event.nit;
    (document.getElementById('button-2x')).click();
    this.notaCredito = event;
    if (this.notaCredito) {
      this.cliente = this.notaCredito.cliente;
    }
  }

  createPagoParcial(): void {
    if (this.notaCredito) {
      this.pagoParcial.notaCredito = this.notaCredito;
      this.pagoParcialService.create(this.pagoParcial).subscribe(response => {
        this.router.navigate(['/pagos-parciales/index']);
        Swal.fire('¡Pago Realizado!', response.mensaje, 'success');
      },
        error => {
          Swal.fire('Error', error.error.error, 'error');
        });
    } else {
      Swal.fire('Advertencia', 'Debe seleccionar una nota de crédito', 'warning');
    }
  }

}
