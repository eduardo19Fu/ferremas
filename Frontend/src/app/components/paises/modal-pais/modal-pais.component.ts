import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Pais } from 'src/app/models/pais';
import { PaisService } from 'src/app/services/paises/pais.service';

/** Resultado con el que se cierra el modal al guardar. */
export interface ResultadoPais {
  edicion: boolean;
  response: any;
}

/**
 * Modal para registrar o editar un pais.
 * Se abre con NgbModal; para editar se le asigna `id` (si no, registra uno nuevo).
 */
@Component({
  selector: 'app-modal-pais',
  templateUrl: './modal-pais.component.html'
})
export class ModalPaisComponent implements OnInit, AfterViewInit {

  /** Id del pais a editar. Vacío = registrar uno nuevo. */
  @Input() id: number;

  pais = new Pais();
  guardando = false;

  @ViewChild('campo') campo: ElementRef<HTMLInputElement>;

  constructor(
    public activeModal: NgbActiveModal,
    private paisService: PaisService
  ) { }

  get esEdicion(): boolean {
    return !!this.id;
  }

  get title(): string {
    return this.esEdicion ? 'Editar país' : 'Nuevo país';
  }

  ngOnInit(): void {
    if (this.id) {
      this.paisService.getPais(this.id).subscribe(pais => this.pais = pais);
    }
  }

  ngAfterViewInit(): void {
    // el foco se pone tras la animacion de apertura del modal
    setTimeout(() => this.campo?.nativeElement.focus(), 150);
  }

  guardar(): void {
    if (this.guardando) {
      return;
    }
    this.guardando = true;

    const peticion = this.esEdicion ? this.paisService.update(this.pais) : this.paisService.create(this.pais);
    peticion.subscribe(
      response => this.activeModal.close({ edicion: this.esEdicion, response } as ResultadoPais),
      () => this.guardando = false
    );
  }
}
