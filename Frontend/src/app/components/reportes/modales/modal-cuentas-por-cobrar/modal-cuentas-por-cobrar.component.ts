import { Component, OnInit } from '@angular/core';

import { Cliente } from '../../../../models/cliente';
import { ClienteService } from '../../../../services/cliente.service';
import { ReporteService } from '../../../../services/reportes/reporte.service';
import { ModalReporteBase } from '../modal-reporte-base';

/** Saldos pendientes de las notas de credito (ventas al credito), de todos los clientes o de uno (PDF o Excel). */
@Component({
  selector: 'app-modal-cuentas-por-cobrar',
  templateUrl: './modal-cuentas-por-cobrar.component.html'
})
export class ModalCuentasPorCobrarComponent extends ModalReporteBase implements OnInit {

  title = 'Cuentas por Cobrar';

  idCliente = 0;
  soloVencidas = false;
  clientes: Cliente[] = [];

  constructor(reporteService: ReporteService, private clienteService: ClienteService) {
    super(reporteService);
  }

  ngOnInit(): void {
    this.clienteService.getClientes().subscribe(clientes => this.clientes = clientes, () => this.clientes = []);
  }

  onSubmit(): void {
    this.generar('cuentas-por-cobrar', {
      idCliente: Number(this.idCliente) || 0,
      soloVencidas: this.soloVencidas
    }, 'cuentas_por_cobrar');
  }
}
