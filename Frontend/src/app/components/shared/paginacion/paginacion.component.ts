import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Controles de paginacion para tablas con datos servidos paginados desde el backend.
 */
@Component({
  selector: 'app-paginacion',
  templateUrl: './paginacion.component.html'
})
export class PaginacionComponent {

  @Input() totalElements = 0;
  @Input() totalPages = 0;
  @Input() page = 0; // base 0
  @Input() size = 10;
  @Input() sizes: number[] = [10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  get desde(): number {
    return this.totalElements === 0 ? 0 : this.page * this.size + 1;
  }

  get hasta(): number {
    return Math.min((this.page + 1) * this.size, this.totalElements);
  }

  /** Numeros de pagina visibles (ventana de 5 alrededor de la actual). */
  get paginas(): number[] {
    const inicio = Math.max(0, Math.min(this.page - 2, this.totalPages - 5));
    const fin = Math.min(this.totalPages, inicio + 5);
    const paginas: number[] = [];
    for (let i = inicio; i < fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  ir(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPages || pagina === this.page) {
      return;
    }
    this.pageChange.emit(pagina);
  }

  cambiarTamanio(valor: string): void {
    this.sizeChange.emit(Number(valor));
  }
}
