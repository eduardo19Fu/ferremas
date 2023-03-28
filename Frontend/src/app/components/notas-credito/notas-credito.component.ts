import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DetailService } from 'src/app/services/facturas/detail.service';
import { NotaCredito } from '../../models/nota-credito';
import { NotasCreditoService } from '../../services/notas/notas-credito.service';
import { JqueryConfigs } from '../../utils/jquery/jquery-utils';

@Component({
  selector: 'app-notas-credito',
  templateUrl: './notas-credito.component.html',
  styles: [
  ]
})
export class NotasCreditoComponent implements OnInit {

  title: string;
  jQueryConfigs: JqueryConfigs;

  notasCredito: NotaCredito[];

  constructor(
    private notasService: NotasCreditoService,
    public auth: AuthService,
    public detailService: DetailService
  ) {
    this.title = 'Notas de Crédito';
    this.jQueryConfigs = new JqueryConfigs();
  }

  ngOnInit(): void {
    this.loadNotasCredito();
  }

  loadNotasCredito(): void {
    this.notasService.getNotasCredito().subscribe(res => {
      this.notasCredito = res;
      this.jQueryConfigs.configDataTable('notas-credito');
    });
  }

}
