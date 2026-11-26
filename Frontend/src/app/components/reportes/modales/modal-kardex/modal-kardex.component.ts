import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { Producto } from '../../../../models/producto';
import { ProductoService } from '../../../../services/producto.service';
import { ReporteService } from '../../../../services/reportes/reporte.service';
import { hoyIso, ModalReporteBase, primerDiaDelMesIso } from '../modal-reporte-base';

/** Kardex de un producto: movimientos del rango con saldo acumulado (PDF o Excel). */
@Component({
  selector: 'app-modal-kardex',
  templateUrl: './modal-kardex.component.html'
})
export class ModalKardexComponent extends ModalReporteBase implements OnInit, OnDestroy {

  title = 'Kardex de Producto';

  fechaIni: string = primerDiaDelMesIso();
  fechaFin: string = hoyIso();

  busqueda = '';
  resultados: Producto[] = [];
  buscando = false;
  producto: Producto | null = null;

  private terminos = new Subject<string>();
  private suscripcion?: Subscription;

  constructor(reporteService: ReporteService, private productoService: ProductoService) {
    super(reporteService);
  }

  ngOnInit(): void {
    this.suscripcion = this.terminos.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termino => {
        this.buscando = true;
        return this.productoService.getProductosPaginado(0, 8, termino);
      })
    ).subscribe(
      pagina => {
        this.buscando = false;
        this.resultados = pagina.content;
      },
      () => {
        this.buscando = false;
        this.resultados = [];
      }
    );
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  get rangoValido(): boolean {
    return this.rango(this.fechaIni, this.fechaFin);
  }

  onBuscar(termino: string): void {
    this.busqueda = termino;
    if (termino.trim().length < 2) {
      this.resultados = [];
      return;
    }
    this.terminos.next(termino.trim());
  }

  seleccionar(producto: Producto): void {
    this.producto = producto;
    this.resultados = [];
    this.busqueda = '';
  }

  quitar(): void {
    this.producto = null;
  }

  onSubmit(): void {
    if (!this.producto || !this.rangoValido) {
      return;
    }
    this.generar('kardex', {
      idProducto: this.producto.idProducto,
      fechaIni: this.fechaIni,
      fechaFin: this.fechaFin
    }, `kardex_${this.producto.codProducto || this.producto.idProducto}`);
  }
}
