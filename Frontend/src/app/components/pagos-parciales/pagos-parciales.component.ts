import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit } from '@angular/core';
import { PagoParcialService } from '../../services/pago-parcial.service';
import { PagoParcial } from '../../models/pago-parcial';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pagos-parciales',
  templateUrl: './pagos-parciales.component.html',
  styles: [
  ]
})
export class PagosParcialesComponent extends ListaPaginada<PagoParcial> implements OnInit {

  title: string;


  constructor(
    private pagosService: PagoParcialService,
    public auth: AuthService
  ) {
    super();
    this.title = 'Pagos Parciales';
  }

  protected fetch(page: number, size: number, search: string, sort: string): Observable<Page<PagoParcial>> {
    return this.pagosService.getPaginado(page, size, search, sort);
  }

  get pagosParciales(): PagoParcial[] {
    return this.items;
  }

  ngOnInit(): void {
    this.loadPagosParciales();
  }

  loadPagosParciales(): void {
    this.cargar();
  }

}
