import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { global } from './global';
import { PagoParcial } from '../models/pago-parcial';

import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class PagoParcialService {

  url: string;

  constructor(private httpClient: HttpClient) {
    this.url = global.url;
  }

  getPagosParciales(): Observable<PagoParcial[]> {
    return this.httpClient.get<PagoParcial[]>(`${this.url}/pagos-parciales/`).pipe(
      catchError(e => {
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  getPagoParcial(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.url}/pagos-parciales/${id}`).pipe(
      catchError(e => {
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  create(pagoParcial: PagoParcial): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/pagos-parciales/`, pagoParcial).pipe(
      catchError(e => {
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }
}
