import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/** Selector "Mostrar N registros" para la barra de herramientas de una tabla paginada. */
@Component({
  selector: 'app-tamanio-pagina',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="tm-pag-size mb-0">
      <span>Mostrar</span>
      <select class="custom-select custom-select-sm" [ngModel]="size" (ngModelChange)="sizeChange.emit(+$event)"
        aria-label="Registros por página">
        <option *ngFor="let s of sizes" [ngValue]="s">{{ s }}</option>
      </select>
      <span>registros</span>
    </label>
  `
})
export class TamanioPaginaComponent {
  @Input() size = 10;
  @Input() sizes: number[] = [10, 25, 50, 100];
  @Output() sizeChange = new EventEmitter<number>();
}
