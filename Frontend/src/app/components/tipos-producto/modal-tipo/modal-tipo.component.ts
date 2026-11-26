import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TipoProducto } from 'src/app/models/tipo-producto';
import { AuthService } from 'src/app/services/auth.service';
import { TipoProductoService } from 'src/app/services/tipo-producto.service';
import { UsuarioService } from 'src/app/services/usuarios/usuario.service';

/** Resultado con el que se cierra el modal al guardar. */
export interface ResultadoTipo {
  edicion: boolean;
  response: any;
}

/**
 * Modal para registrar o editar una categoria (tipo de producto).
 * Se abre con NgbModal; para editar se le asigna `id` (si no, registra una nueva).
 */
@Component({
  selector: 'app-modal-tipo',
  templateUrl: './modal-tipo.component.html'
})
export class ModalTipoComponent implements OnInit, AfterViewInit {

  /** Id de la categoria a editar. Vacío = registrar una nueva. */
  @Input() id: number;

  tipoProducto = new TipoProducto();
  guardando = false;

  @ViewChild('campo') campo: ElementRef<HTMLInputElement>;

  constructor(
    public activeModal: NgbActiveModal,
    private tipoService: TipoProductoService,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) { }

  get esEdicion(): boolean {
    return !!this.id;
  }

  get title(): string {
    return this.esEdicion ? 'Editar categoría' : 'Nueva categoría';
  }

  ngOnInit(): void {
    if (this.id) {
      this.tipoService.getTipoProducto(this.id).subscribe(tipo => this.tipoProducto = tipo);
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

    if (this.esEdicion) {
      this.tipoService.update(this.tipoProducto).subscribe(
        response => this.activeModal.close({ edicion: true, response } as ResultadoTipo),
        () => this.guardando = false
      );
      return;
    }

    this.usuarioService.getUsuario(this.authService.usuario.idUsuario).subscribe(
      usuario => {
        this.tipoProducto.usuario = usuario;
        this.tipoService.create(this.tipoProducto).subscribe(
          response => this.activeModal.close({ edicion: false, response } as ResultadoTipo),
          () => this.guardando = false
        );
      },
      () => this.guardando = false
    );
  }
}
