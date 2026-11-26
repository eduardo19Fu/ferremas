import swal from 'sweetalert2';

import { FormatoReporte, ReporteService } from '../../../services/reportes/reporte.service';

/** Fecha local en formato yyyy-MM-dd (toISOString usaria UTC y puede dar el dia siguiente). */
export function fechaIso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function hoyIso(): string {
  return fechaIso(new Date());
}

export function primerDiaDelMesIso(): string {
  const d = new Date();
  return fechaIso(new Date(d.getFullYear(), d.getMonth(), 1));
}

/** Base de los modales de reportes de gestion: formato, estado de carga y descarga con manejo de errores. */
export abstract class ModalReporteBase {

  formato: FormatoReporte = 'PDF';
  generando = false;

  protected constructor(protected reporteService: ReporteService) { }

  /** Rango de fechas valido: ambas presentes y la final no anterior a la inicial. */
  protected rango(fechaIni: string, fechaFin: string): boolean {
    return !!fechaIni && !!fechaFin && fechaFin >= fechaIni;
  }

  protected generar(ruta: string, params: { [clave: string]: string | number | boolean | null | undefined }, nombreArchivo: string): void {
    if (this.generando) {
      return;
    }
    this.generando = true;

    const formato = this.formato;
    this.reporteService.obtener(ruta, params, formato).subscribe(
      archivo => {
        this.generando = false;
        this.reporteService.mostrar(archivo, formato, nombreArchivo);
      },
      async error => {
        this.generando = false;
        const detalle = await this.reporteService.mensajeDeError(error, 'Revise los datos e intente de nuevo.');
        swal.fire('No se pudo generar el reporte', detalle, 'error');
      }
    );
  }
}
