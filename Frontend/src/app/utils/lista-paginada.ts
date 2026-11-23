import { Directive, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Page } from '../models/page';
import { TablaOrden } from '../components/shared/th-sortable/th-sortable.directive';

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
  sort: TablaOrden | null = null;
  cargando = false;

  private busqueda$ = new Subject<string>();
  private busquedaSub: Subscription = this.busqueda$
    .pipe(debounceTime(350), distinctUntilChanged())
    .subscribe(() => {
      this.page = 0;
      this.cargar();
    });

  protected abstract fetch(page: number, size: number, search: string, sort: string): Observable<Page<T>>;

  cargar(): void {
    this.cargando = true;
    this.fetch(this.page, this.size, this.search, this.sortParam).subscribe(
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

  /** Valor del parametro `sort` para el backend ("campo,dir"), o vacio si no hay orden elegido. */
  get sortParam(): string {
    return this.sort ? `${this.sort.key},${this.sort.dir}` : '';
  }

  /** Ciclo por columna: ascendente -> descendente -> sin orden (vuelve al orden por defecto). */
  onSort(key: string): void {
    if (!this.sort || this.sort.key !== key) {
      this.sort = { key, dir: 'asc' };
    } else if (this.sort.dir === 'asc') {
      this.sort = { key, dir: 'desc' };
    } else {
      this.sort = null;
    }
    this.page = 0;
    this.cargar();
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
