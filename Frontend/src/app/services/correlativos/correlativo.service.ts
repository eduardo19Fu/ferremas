import { Injectable } from '@angular/core';
import { Correlativo } from 'src/app/models/correlativo';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { global } from '../global';
import swal from 'sweetalert2';
import { map, catchError } from 'rxjs/operators';
import { Page } from 'src/app/models/page';

@Injectable({
  providedIn: 'root'
})
export class CorrelativoService {

  url: string;

  constructor(
    private http: HttpClient
  ) {
    this.url = global.url;
  }

  getCorrelativos(): Observable<Correlativo[]>{
    return this.http.get<Correlativo[]>(`${this.url}/correlativos`);
  }

  getCorrelativosPage(page: number): Observable<any>{
    return this.http.get<any>(`${this.url}/correlativos/page/${page}`).pipe(
      map((response: any) => {
        (response.content as Correlativo[]).map(correlativo => {
          return correlativo;
        });
        return response;
      })
    );
  }

  getCorrelativo(id: number): Observable<Correlativo>{
    return this.http.get<Correlativo>(`${this.url}/correlativos/${id}`).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  getCorrelativoPorUsuario(idusuario: number): Observable<Correlativo>{
    return this.http.get<Correlativo>(`${this.url}/correlativos/usuario/${idusuario}`).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  create(correlativo: Correlativo): Observable<any>{
    return this.http.post<any>(`${this.url}/correlativos`, correlativo).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  update(correlativo: Correlativo): Observable<any>{
    return this.http.put<any>(`${this.url}/correlativos`, correlativo).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<any>{
    return this.http.delete<any>(`${this.url}/correlativos/${id}`).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  /** Listado paginado desde el backend, con busqueda opcional. */
  getPaginado(page: number, size: number, search: string = '', sort: string = ''): Observable<Page<Correlativo>> {
    const params: any = { page: String(page), size: String(size) };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (sort) {
      params.sort = sort;
    }
    return this.http.get<Page<Correlativo>>(`${this.url}/correlativos/paginado`, { params });
  }
}
