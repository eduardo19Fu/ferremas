import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Estado vacío de una tabla. Distingue entre "no hay datos todavía" y
 * "la búsqueda no encontró coincidencias" (con acción para limpiarla).
 */
@Component({
  selector: 'app-sin-registros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tm-empty" role="status">
      <div class="tm-empty-icon" [class.is-search]="busqueda" aria-hidden="true">
        <svg *ngIf="busqueda" viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor"
          stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="21" cy="21" r="12"/><path d="M30 30l11 11"/><path d="M16 21h10" opacity=".55"/>
        </svg>
        <svg *ngIf="!busqueda" viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor"
          stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 28l6-16h24l6 16"/><path d="M6 28v10a2 2 0 002 2h32a2 2 0 002-2V28H31a7 7 0 01-14 0H6z"/>
        </svg>
      </div>

      <h4 class="tm-empty-title">{{ busqueda ? 'Sin resultados' : 'Aún no hay ' + entidad }}</h4>

      <p class="tm-empty-text" *ngIf="busqueda">
        No encontramos {{ entidad }} que coincidan con <strong>“{{ busqueda }}”</strong>.
        Revisa la ortografía o prueba con otro término.
      </p>
      <p class="tm-empty-text" *ngIf="!busqueda">
        {{ mensaje || 'Cuando se registren, aparecerán aquí.' }}
      </p>

      <button type="button" class="btn btn-sm btn-outline-primary" *ngIf="busqueda" (click)="limpiar.emit()">
        <i class="fas fa-times"></i> Limpiar búsqueda
      </button>
    </div>
  `
})
export class SinRegistrosComponent {
  /** Nombre en plural de lo que se lista: "facturas", "clientes"... */
  @Input() entidad = 'registros';
  /** Término de búsqueda activo (vacío si no hay filtro). */
  @Input() busqueda = '';
  /** Texto opcional cuando no hay búsqueda activa. */
  @Input() mensaje = '';
  @Output() limpiar = new EventEmitter<void>();
}
