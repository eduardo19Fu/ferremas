import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MarcaProducto } from 'src/app/models/marca-producto';
import { AuthService } from 'src/app/services/auth.service';
import { MarcaProductoService } from 'src/app/services/marca-producto.service';
import { UsuarioService } from 'src/app/services/usuarios/usuario.service';

/** Resultado con el que se cierra el modal al guardar. */
export interface ResultadoMarca {
  edicion: boolean;
  response: any;
}

/**
 * Modal para registrar o editar una marca de producto.
 * Se abre con NgbModal; para editar se le asigna `id` (si no, registra una nueva).
 */
@Component({
  selector: 'app-modal-marca',
  templateUrl: './modal-marca.component.html'
})
export class ModalMarcaComponent implements OnInit, AfterViewInit {

  /** Id de la marca a editar. Vacío = registrar una nueva. */
  @Input() id: number;

  marcaProducto = new MarcaProducto();
  guardando = false;

  @ViewChild('campo') campo: ElementRef<HTMLInputElement>;

  constructor(
    public activeModal: NgbActiveModal,
    private marcaService: MarcaProductoService,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) { }

  get esEdicion(): boolean {
    return !!this.id;
  }

  get title(): string {
    return this.esEdicion ? 'Editar marca' : 'Nueva marca';
  }

  ngOnInit(): void {
    if (this.id) {
      this.marcaService.getMarca(this.id).subscribe(marca => this.marcaProducto = marca);
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
      this.marcaService.update(this.marcaProducto).subscribe(
        response => this.activeModal.close({ edicion: true, response } as ResultadoMarca),
        () => this.guardando = false
      );
      return;
    }

    this.usuarioService.getUsuario(this.authService.usuario.idUsuario).subscribe(
      usuario => {
        this.marcaProducto.usuario = usuario;
        this.marcaService.create(this.marcaProducto).subscribe(
          response => this.activeModal.close({ edicion: false, response } as ResultadoMarca),
          () => this.guardando = false
        );
      },
      () => this.guardando = false
    );
  }
}
