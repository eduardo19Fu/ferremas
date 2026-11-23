import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NotaCredito } from '../../../models/nota-credito';
import { NotasCreditoService } from '../../../services/notas/notas-credito.service';

@Component({
  selector: 'app-modal-notas-credito',
  templateUrl: './modal-notas-credito.component.html',
  styleUrls: ['./modal-notas-credito.component.css']
})
export class ModalNotasCreditoComponent extends ListaPaginada<NotaCredito> implements OnInit {

  @Output() notaCredito = new EventEmitter<NotaCredito>();

  title: string;

  constructor(
    private notasService: NotasCreditoService
  ) {
    super();
    this.title = 'Notas de Credito';
  }

  protected fetch(page: number, size: number, search: string): Observable<Page<NotaCredito>> {
    return this.notasService.getPaginado(page, size, search, true);
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

  chooseNotaCredito(notaCredito: NotaCredito): void {
    this.notaCredito.emit(notaCredito);
    console.log(notaCredito);
  }

}
