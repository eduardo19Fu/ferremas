import { Observable } from 'rxjs';
import { Page } from 'src/app/models/page';
import { ListaPaginada } from 'src/app/utils/lista-paginada';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';

import { Cliente } from 'src/app/models/cliente';
import { ClienteService } from '../../../../services/cliente.service';


@Component({
  selector: 'app-modal-buscar-cliente',
  templateUrl: './modal-buscar-cliente.component.html',
  styles: [
  ]
})
export class ModalBuscarClienteComponent extends ListaPaginada<Cliente> implements OnInit {

  @Output() cliente = new EventEmitter<Cliente>();

  title: string;

  constructor(
    private clienteService: ClienteService
  ) {
    super();
    this.title = 'Búsqueda de Clientes';
  }

  protected fetch(page: number, size: number, search: string): Observable<Page<Cliente>> {
    return this.clienteService.getPaginado(page, size, search);
  }

  get clientes(): Cliente[] {
    return this.items;
  }

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void{
    this.cargar();
  }

  chooseCliente(cliente: Cliente): void {
    this.cliente.emit(cliente);
    console.log(cliente);
  }

}
