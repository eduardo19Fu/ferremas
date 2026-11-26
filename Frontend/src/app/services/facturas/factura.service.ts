import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Factura } from 'src/app/models/factura';

import { global } from '../global';
import swal from 'sweetalert2';
import { Page } from 'src/app/models/page';
import { DetalleFacturaItem } from 'src/app/models/detalle-factura-item';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {

  private url: string;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.url = global.url;
  }

  getFacturas(): Observable<Factura[]>{
    return this.http.get<Factura[]>(`${this.url}/facturas`);
  }

  getFacturasPage(page: number): Observable<any>{
    return this.http.get<any>(`${this.url}/facturas/page/${page}`).pipe(
      map((response: any) => {
        (response.content as Factura[]).map(factura => {
          return factura;
        });
        return response;
      })
    );
  }

  getFacturasSP(fechaIni: Date, fechaFin: Date): Observable<any> {
    const httpParams = new HttpParams()
      .set('fechaIni', fechaIni.toString())
      .set('fechaFin', fechaFin.toString());

    return this.http.get<any>(`${this.url}/facturas/fecha?fechaIni=${fechaIni.toString()}&fechaFin=${fechaFin.toString()}`).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  getFactura(id: number): Observable<Factura>{
    return this.http.get<Factura>(`${this.url}/facturas/factura/${id}`).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  getMaxVentas(): Observable<any> {
    return this.http.get<any>(`${this.url}/facturas/max-ventas/get`).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  cancel(id: number, idusuario: number): Observable<any>{
    return this.http.delete<any>(`${this.url}/facturas/cancel/${id}/${idusuario}`).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  create(factura: Factura): Observable<any>{
    return this.http.post<any>(`${this.url}/facturas`, factura).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  deletePorFecha(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
          .set('startDate', startDate.toString())
          .set('endDate', endDate.toString());

    return this.http.delete<any>(`${this.url}/facturas/eliminar/fecha`, {params}).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  /*********** FACTURA PDF **************/
  getBillPDF(idfactura: number): Observable<any>{
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/pdf');
    const requestOptions: any = { headers, responseType: 'blob' };

    return this.http.get<any>(`${this.url}/facturas/generate/${idfactura}`, requestOptions).pipe(
      map((response: any) => {
        return{
          filename: 'factura.pdf',
          data: new Blob([response], { type: 'application/pdf' })
        };
      })
    );
  }

  /** Facturas vigentes de un dia (fecha yyyy-MM-dd). idUsuario 0 = todos los vendedores. */
  getVentasDiarias(fecha: string, idUsuario: number, formato: 'PDF' | 'XLSX'): Observable<Blob> {
    const params: any = { fecha, formato };
    if (idUsuario) {
      params.idUsuario = String(idUsuario);
    }
    return this.http.get(`${this.url}/facturas/ventas-diarias`, { params, responseType: 'blob' });
  }

  /** Ventas por mes de un anio. idUsuario 0 = todos los vendedores. */
  getVentasMensuales(anio: number, idUsuario: number, formato: 'PDF' | 'XLSX'): Observable<Blob> {
    const params: any = { anio: String(anio), formato };
    if (idUsuario) {
      params.idUsuario = String(idUsuario);
    }
    return this.http.get(`${this.url}/facturas/ventas-mensuales`, { params, responseType: 'blob' });
  }

  getSellsDaillyReportPDF(cajero: number, fecha: Date): Observable<any>{
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/pdf');
    const requestOptions: any = {headers, responseType: 'blob'};

    return this.http.get<any>(`${this.url}/facturas/daily-sales?usuario=${cajero}&fecha=${fecha.toString()}`, requestOptions).pipe(
      map((response: any) => {
        return {
          filename: 'poliza.pdf',
          data: new Blob([response], {type: 'application/pdf'})
        };
      })
    );
  }

  /** Listado paginado desde el backend, con busqueda opcional. */
  getPaginado(page: number, size: number, search: string = '', fechaIni?: Date, fechaFin?: Date, sort: string = ''): Observable<Page<Factura>> {
    const params: any = { page: String(page), size: String(size) };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (fechaIni && fechaFin) {
      params.fechaIni = fechaIni.toString();
      params.fechaFin = fechaFin.toString();
    }
    if (sort) {
      params.sort = sort;
    }
    return this.http.get<Page<Factura>>(`${this.url}/facturas/paginado`, { params });
  }

  /** Detalle (productos) de una factura, paginado desde el backend. */
  getDetallePaginado(idFactura: number, page: number, size: number, sort: string = ''): Observable<Page<DetalleFacturaItem>> {
    const params: any = { page: String(page), size: String(size) };
    if (sort) {
      params.sort = sort;
    }
    return this.http.get<Page<DetalleFacturaItem>>(`${this.url}/facturas/${idFactura}/detalle`, { params });
  }
}
