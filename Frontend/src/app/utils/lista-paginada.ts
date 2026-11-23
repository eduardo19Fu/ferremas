import { Directive, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Page } from '../models/page';

/**
 * Base para pantallas de listado cuyos datos se sirven paginados desde el backend.
 * La clase hija implementa `fetch` y usa `cargar()`, `onBuscar()`, `onPageChange()` y `onSizeChange()`.
 */
@Directive()
export abstract class ListaPaginada<T> implements OnDestroy {

  items: T[] = [];
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  search = '';
  cargando = false;

  private busqueda$ = new Subject<string>();
  private busquedaSub: Subscription = this.busqueda$
    .pipe(debounceTime(350), distinctUntilChanged())
    .subscribe(() => {
      this.page = 0;
      this.cargar();
    });

  protected abstract fetch(page: number, size: number, search: string): Observable<Page<T>>;

  cargar(): void {
    this.cargando = true;
    this.fetch(this.page, this.size, this.search).subscribe(
      response => {
        this.items = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.page = response.number;
        this.cargando = false;
      },
      () => { this.cargando = false; }
    );
  }

  onBuscar(valor: string): void {
    this.search = valor;
    this.busqueda$.next(valor);
  }

  onPageChange(page: number): void {
    this.page = page;
    this.cargar();
  }

  onSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.cargar();
  }

  /** Recarga la pagina actual tras eliminar un registro (retrocede si quedo vacia). */
  recargarTrasEliminar(): void {
    if (this.items.length === 1 && this.page > 0) {
      this.page--;
    }
    this.cargar();
  }

  ngOnDestroy(): void {
    this.busquedaSub.unsubscribe();
  }
}
