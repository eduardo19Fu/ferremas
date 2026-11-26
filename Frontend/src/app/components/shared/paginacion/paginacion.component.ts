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
  /** false cuando el selector "Mostrar" va en la barra superior de la tabla. */
  @Input() mostrarTamanio = true;
  /** true para mostrar siempre el selector de paginas, aunque solo exista una. */
  @Input() siempreNav = false;

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
    const total = this.paginasTotales;
    const inicio = Math.max(0, Math.min(this.page - 2, total - 5));
    const fin = Math.min(total, inicio + 5);
    const paginas: number[] = [];
    for (let i = inicio; i < fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  /** Total de paginas para mostrar (al menos 1, para el caso de una sola pagina). */
  get paginasTotales(): number {
    return Math.max(this.totalPages, 1);
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
