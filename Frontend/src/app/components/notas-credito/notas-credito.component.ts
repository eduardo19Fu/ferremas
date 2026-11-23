import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DetailService } from 'src/app/services/facturas/detail.service';
import { NotaCredito } from '../../models/nota-credito';
import { NotasCreditoService } from '../../services/notas/notas-credito.service';

@Component({
  selector: 'app-notas-credito',
  templateUrl: './notas-credito.component.html',
  styles: [
  ]
})
export class NotasCreditoComponent extends ListaPaginada<NotaCredito> implements OnInit {

  title: string;


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

  loadNotasCredito(): void {
    this.cargar();
  }

}
