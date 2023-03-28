import { Component, OnInit } from '@angular/core';
import { PagoParcialService } from '../../services/pago-parcial.service';
import { PagoParcial } from '../../models/pago-parcial';
import { JqueryConfigs } from '../../utils/jquery/jquery-utils';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pagos-parciales',
  templateUrl: './pagos-parciales.component.html',
  styles: [
  ]
})
export class PagosParcialesComponent implements OnInit {

  title: string;
  jQueryConfigs: JqueryConfigs;

  pagosParciales: PagoParcial[];

  constructor(
    private pagosService: PagoParcialService,
    public auth: AuthService
  ) {
    this.title = 'Pagos Parciales';
    this.jQueryConfigs = new JqueryConfigs();
  }

  ngOnInit(): void {
    this.loadPagosParciales();
  }

  loadPagosParciales(): void {
    this.pagosService.getPagosParciales().subscribe(pagosParciales => {
      this.pagosParciales = pagosParciales;
      this.jQueryConfigs.configDataTable('pagos-parciales');
    });
  }

}
