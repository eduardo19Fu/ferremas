import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { global } from '../global';
import { NotaCredito } from 'src/app/models/nota-credito';

import Swal from 'sweetalert2';
import { Page } from 'src/app/models/page';
import { DetalleNotaCreditoItem } from 'src/app/models/detalle-nota-credito-item';

@Injectable({
  providedIn: 'root'
})
export class NotasCreditoService {

  url: string;

  constructor(private httpClient: HttpClient) {
    this.url = global.url;
  }

  getNotasCredito(): Observable<NotaCredito[]> {
    return this.httpClient.get<NotaCredito[]>(`${this.url}/notas-credito`).pipe(
      catchError(e => {
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  getNotasCreditoActivas(): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/notas-credito/activas`).pipe(
      catchError(e => {
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  getNotaCredito(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/notas-credito/${id}`).pipe(
      catchError(e => {
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  create(notaCredito: NotaCredito): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/notas-credito`, notaCredito).pipe(
      catchError(e => {
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  /** Listado paginado desde el backend, con busqueda opcional. */
  getPaginado(page: number, size: number, search: string = '', activas: boolean = false, sort: string = ''): Observable<Page<NotaCredito>> {
    const params: any = { page: String(page), size: String(size) };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (activas) {
      params.activas = 'true';
    }
    if (sort) {
      params.sort = sort;
    }
    return this.httpClient.get<Page<NotaCredito>>(`${this.url}/notas-credito/paginado`, { params });
  }

  /** Detalle (productos) de una nota de credito, paginado desde el backend. */
  getDetallePaginado(idNota: number, page: number, size: number, sort: string = ''): Observable<Page<DetalleNotaCreditoItem>> {
    const params: any = { page: String(page), size: String(size) };
    if (sort) {
      params.sort = sort;
    }
    return this.httpClient.get<Page<DetalleNotaCreditoItem>>(`${this.url}/notas-credito/${idNota}/detalle`, { params });
  }
}
