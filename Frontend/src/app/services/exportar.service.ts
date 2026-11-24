import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { global } from './global';

/**
 * Descarga de listados exportados a Excel desde el backend (`/api/<recurso>/exportar`).
 * El archivo lo arma el servidor con el mismo filtro y orden del listado en pantalla.
 */
@Injectable({
  providedIn: 'root'
})
export class ExportarService {

  private url = global.url;

  constructor(private http: HttpClient) { }

  /**
   * Pide el archivo y lo entrega al navegador como descarga.
   *
   * @param ruta    ruta del recurso, p. ej. 'productos/exportar'
   * @param params  filtros del listado (search, sort, fechas...); se omiten los vacios
   * @param prefijo prefijo del nombre del archivo, p. ej. 'productos' -> productos_20261124_1530.xlsx
   */
  descargarExcel(ruta: string, params: { [clave: string]: string }, prefijo: string): Observable<void> {
    const filtrados: { [clave: string]: string } = {};
    Object.keys(params).forEach(clave => {
      if (params[clave]) {
        filtrados[clave] = params[clave];
      }
    });

    return this.http.get(`${this.url}/${ruta}`, { params: filtrados, responseType: 'blob' }).pipe(
      map(blob => {
        const archivo = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const enlace = document.createElement('a');
        const direccion = window.URL.createObjectURL(archivo);
        enlace.href = direccion;
        enlace.download = `${prefijo}_${this.marcaDeTiempo()}.xlsx`;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        setTimeout(() => window.URL.revokeObjectURL(direccion), 1000);
      })
    );
  }

  private marcaDeTiempo(): string {
    const f = new Date();
    const dos = (n: number) => String(n).padStart(2, '0');
    return `${f.getFullYear()}${dos(f.getMonth() + 1)}${dos(f.getDate())}_${dos(f.getHours())}${dos(f.getMinutes())}`;
  }
}
