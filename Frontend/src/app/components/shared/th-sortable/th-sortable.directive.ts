import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

export interface TablaOrden {
  key: string;
  dir: 'asc' | 'desc';
}

/**
 * Cabecera de columna ordenable (el orden se aplica en el servidor).
 * Uso: <th tmSortable="nombre" [sort]="sort" (tmSort)="onSort($event)">Nombre</th>
 */
@Directive({
  selector: 'th[tmSortable]'
})
export class ThSortableDirective {

  @Input() tmSortable = '';
  @Input() sort: TablaOrden | null = null;
  @Output() tmSort = new EventEmitter<string>();

  @HostBinding('class.tm-sortable') readonly sortable = true;
  @HostBinding('attr.tabindex') readonly tabindex = 0;
  @HostBinding('attr.role') readonly role = 'columnheader';

  @HostBinding('class.is-asc') get asc(): boolean {
    return !!this.sort && this.sort.key === this.tmSortable && this.sort.dir === 'asc';
  }

  @HostBinding('class.is-desc') get desc(): boolean {
    return !!this.sort && this.sort.key === this.tmSortable && this.sort.dir === 'desc';
  }

  @HostBinding('attr.aria-sort') get ariaSort(): string {
    return this.asc ? 'ascending' : this.desc ? 'descending' : 'none';
  }

  @HostListener('click')
  @HostListener('keydown.enter')
  @HostListener('keydown.space', ['$event'])
  onActivate(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.tmSort.emit(this.tmSortable);
  }
}
