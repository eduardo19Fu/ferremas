import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { global } from '../global';

export type FormatoReporte = 'PDF' | 'XLSX';

const TIPOS: Record<FormatoReporte, string> = {
  PDF: 'application/pdf',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

/** Descarga de los reportes de gestion (/api/reportes/...): PDF en una pestana nueva, Excel como archivo. */
@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private url = global.url;

  constructor(private http: HttpClient) { }

  /** Pide el reporte al servidor. Los parametros vacios (null, undefined, '') no se envian. */
  obtener(ruta: string, params: { [clave: string]: string | number | boolean | null | undefined }, formato: FormatoReporte): Observable<Blob> {
    const query: { [clave: string]: string } = { formato };
    Object.keys(params).forEach(clave => {
      const valor = params[clave];
      if (valor !== null && valor !== undefined && valor !== '') {
        query[clave] = String(valor);
      }
    });
    return this.http.get(`${this.url}/reportes/${ruta}`, { params: query, responseType: 'blob' });
  }

  /** Muestra el PDF o descarga el Excel recibido. */
  mostrar(archivo: Blob, formato: FormatoReporte, nombre: string): void {
    const url = window.URL.createObjectURL(new Blob([archivo], { type: TIPOS[formato] }));
    if (formato === 'PDF') {
      window.open(url, '_blank');
    } else {
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `${nombre}.xlsx`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
    }
    // se libera tarde para que la pestana nueva alcance a cargar el archivo
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  }

  /** El error de una descarga llega como Blob: se lee el mensaje que devolvio el servidor, si lo hay. */
  async mensajeDeError(e: any, porDefecto: string): Promise<string> {
    try {
      if (e && e.error instanceof Blob) {
        const cuerpo = JSON.parse(await e.error.text());
        return cuerpo.error || cuerpo.mensaje || porDefecto;
      }
    } catch {
      // cuerpo que no es JSON: se usa el mensaje por defecto
    }
    return porDefecto;
  }
}
