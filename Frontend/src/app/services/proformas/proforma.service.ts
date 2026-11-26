import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import swal from 'sweetalert2';

import { global } from '../global';
import { Page } from 'src/app/models/page';
import { Proforma } from 'src/app/models/proforma';
import { DetalleProformaItem, ProformaResumen } from 'src/app/models/proforma-resumen';

/** Proformas (cotizaciones): consulta, registro, edicion y reportes. */
@Injectable({
  providedIn: 'root'
})
export class ProformaService {

  private url = global.url;

  constructor(private http: HttpClient) { }

  /** Listado paginado con busqueda, rango de fechas y usuario opcionales. */
  getPaginado(page: number, size: number, search: string = '', fechaIni?: string, fechaFin?: string,
              idUsuario: number = 0, sort: string = ''): Observable<Page<ProformaResumen>> {
    const params: any = { page: String(page), size: String(size) };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (fechaIni && fechaFin) {
      params.fechaIni = fechaIni;
      params.fechaFin = fechaFin;
    }
    if (idUsuario) {
      params.idUsuario = String(idUsuario);
    }
    if (sort) {
      params.sort = sort;
    }
    return this.http.get<Page<ProformaResumen>>(`${this.url}/proformas/paginado`, { params });
  }

  /** Proforma completa (con productos), para editarla o convertirla en factura. */
  getProforma(id: number): Observable<Proforma> {
    return this.http.get<any>(`${this.url}/proformas/${id}`);
  }

  /** Detalle (productos) de una proforma, paginado desde el backend. */
  getDetallePaginado(id: number, page: number, size: number, sort: string = ''): Observable<Page<DetalleProformaItem>> {
    const params: any = { page: String(page), size: String(size) };
    if (sort) {
      params.sort = sort;
    }
    return this.http.get<Page<DetalleProformaItem>>(`${this.url}/proformas/${id}/detalle`, { params });
  }

  /** Indica si la proforma ya fue convertida en una factura vigente. */
  estaFacturada(id: number): Observable<boolean> {
    return this.http.get<{ facturada: boolean }>(`${this.url}/proformas/${id}/facturada`).pipe(map(r => r.facturada));
  }

  create(proforma: Proforma): Observable<any> {
    return this.http.post<any>(`${this.url}/proformas`, proforma).pipe(catchError(e => this.mostrarError(e)));
  }

  update(id: number, proforma: Proforma): Observable<any> {
    return this.http.put<any>(`${this.url}/proformas/${id}`, proforma).pipe(catchError(e => this.mostrarError(e)));
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/proformas/${id}`).pipe(catchError(e => this.mostrarError(e)));
  }

  /** PDF de la proforma. */
  getPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/proformas/generate/${id}`, { responseType: 'blob' });
  }

  /** Reporte de conversion de proformas a facturas (PDF o XLSX). */
  getConversion(fechaIni: string, fechaFin: string, idUsuario: number, formato: 'PDF' | 'XLSX'): Observable<Blob> {
    const params: any = { fechaIni, fechaFin, formato };
    if (idUsuario) {
      params.idUsuario = String(idUsuario);
    }
    return this.http.get(`${this.url}/proformas/conversion`, { params, responseType: 'blob' });
  }

  /** Muestra el motivo que devuelve el servidor (409 ya facturada, 400 datos invalidos...). */
  private mostrarError(e: any): Observable<never> {
    swal.fire(e.error?.mensaje || 'No se pudo completar la operación', e.error?.error || 'Intente de nuevo.', 'error');
    return throwError(e);
  }
}
