import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Esqueleto animado que se muestra mientras se cargan los datos de una tabla. */
@Component({
  selector: 'app-tabla-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tm-skeleton" role="status" aria-live="polite" aria-label="Cargando datos">
      <div class="tm-row tm-head">
        <span class="tm-cell" *ngFor="let c of columnasArr"></span>
      </div>
      <div class="tm-row" *ngFor="let f of filasArr">
        <span class="tm-cell" *ngFor="let c of columnasArr"
          [style.flex]="c === 0 ? '0.4' : (c % 3 === 1 ? '1.6' : '1')"></span>
      </div>
      <span class="sr-only">Cargando datos...</span>
    </div>
  `
})
export class TablaSkeletonComponent {
  columnasArr: number[] = [0, 1, 2, 3, 4];
  filasArr: number[] = [0, 1, 2, 3, 4, 5];

  @Input() set columnas(n: number) {
    this.columnasArr = Array.from({ length: Math.max(n || 1, 1) }, (_, i) => i);
  }

  @Input() set filas(n: number) {
    this.filasArr = Array.from({ length: Math.max(n || 1, 1) }, (_, i) => i);
  }
}
