import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import swal from 'sweetalert2';

import { Cliente } from 'src/app/models/cliente';
import { DetalleProforma } from 'src/app/models/detalle-proforma';
import { Producto } from 'src/app/models/producto';
import { Proforma } from 'src/app/models/proforma';
import { AuthService } from 'src/app/services/auth.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ClienteCreateService } from 'src/app/services/facturas/cliente-create.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ProformaService } from 'src/app/services/proformas/proforma.service';

/**
 * Registro y edicion de proformas (cotizaciones). No mueve inventario: la cantidad solo se limita a las existencias
 * actuales para no cotizar lo que no se puede entregar. Si la ruta trae un id, edita esa proforma.
 */
@Component({
  selector: 'app-create-proforma',
  templateUrl: './create-proforma.component.html'
})
export class CreateProformaComponent implements OnInit {

  title = 'Nueva proforma';

  /** Id de la proforma que se edita (null al crear una nueva). */
  idProforma: number | null = null;
  noProforma: number | null = null;

  cliente: Cliente = new Cliente();
  proforma: Proforma = new Proforma();

  // buscadores
  nitBusqueda = '';
  nitIngresado: string;          // NIT que no existe y se ofrece registrar
  codigoProducto = '';

  // producto en captura
  producto: Producto = new Producto();
  cantidad: number | null = null;
  descuento = 0;

  guardando = false;
  cargando = false;

  constructor(
    private proformaService: ProformaService,
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private clienteCreateService: ClienteCreateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarProforma(id);
    }
  }

  get editando(): boolean {
    return this.idProforma !== null;
  }

  get lineas(): DetalleProforma[] {
    return this.proforma.itemsProforma;
  }

  get total(): number {
    return this.proforma.calcularTotal();
  }

  /** El cliente es opcional (como en las ventas): basta con tener productos. */
  get puedeGuardar(): boolean {
    return this.lineas.length > 0 && !this.guardando;
  }

  /** Verdadero si se escribio algun dato de un cliente que aun no esta registrado. */
  private get hayDatosDeClienteNuevo(): boolean {
    const c = this.cliente;
    return !c?.idCliente && [c?.nit, c?.identificacion, c?.nombre, c?.direccion].some(v => !!(v || '').trim());
  }

  // ----------------------------------------------------------------- carga

  private cargarProforma(id: number): void {
    this.cargando = true;
    this.proformaService.getProforma(id).subscribe(
      datos => {
        this.proforma = Proforma.desde(datos);
        this.idProforma = this.proforma.idProforma;
        this.noProforma = this.proforma.noProforma;
        this.cliente = this.proforma.cliente || new Cliente();
        this.nitBusqueda = this.cliente.nit || '';
        this.title = `Editar proforma No. ${this.noProforma}`;
        this.cargando = false;

        // una proforma ya facturada no se puede modificar
        this.proformaService.estaFacturada(id).subscribe(facturada => {
          if (facturada) {
            swal.fire('Proforma facturada', 'Esta proforma ya fue convertida en una factura y no puede modificarse.', 'info')
              .then(() => this.router.navigate(['/proformas/index']));
          }
        });
      },
      () => {
        this.cargando = false;
        swal.fire('No se pudo cargar la proforma', 'La proforma no existe o no tiene permisos para verla.', 'error')
          .then(() => this.router.navigate(['/proformas/index']));
      }
    );
  }

  // --------------------------------------------------------------- cliente

  buscarCliente(): void {
    const nit = (this.nitBusqueda || '').trim();
    if (!nit) {
      swal.fire('NIT vacío', 'Ingrese un NIT para realizar la búsqueda.', 'warning');
      return;
    }

    this.clienteService.getClienteByNit(nit).subscribe(
      cliente => {
        this.cliente = cliente;
        this.enfocar('codigo-producto');
      },
      error => {
        if (error.status === 404) {
          this.nitIngresado = nit;
          this.clienteCreateService.abrirModal();
        } else {
          swal.fire(`Error: ${error.status}`, 'No se pudo buscar el cliente.', 'error');
        }
      }
    );
  }

  /** Cliente elegido en el buscador de clientes. */
  elegirCliente(cliente: Cliente): void {
    this.nitBusqueda = cliente.nit;
    this.cerrarModal('button-2x');
    this.buscarCliente();
  }

  /** Cliente recien registrado desde el modal de creacion. */
  clienteCreado(cliente: Cliente): void {
    this.cliente = cliente;
    this.nitBusqueda = cliente.nit;
    this.nitIngresado = null;
    this.enfocar('codigo-producto');
  }

  // -------------------------------------------------------------- producto

  buscarProducto(): void {
    const codigo = (this.codigoProducto || '').trim();
    if (!codigo) {
      swal.fire('Código inválido', 'Ingrese un código de producto para realizar la búsqueda.', 'warning');
      return;
    }

    this.productoService.getProductoByCode(codigo).subscribe(
      producto => {
        this.producto = producto;
        this.enfocar('cantidad-producto');
      },
      error => {
        const motivo = error.status === 404 ? (error.error?.mensaje || 'No existe un producto con ese código.') : 'Petición no se puede llevar a cabo.';
        swal.fire(`Error: ${error.status}`, motivo, 'error');
      }
    );
  }

  /** Producto elegido en el buscador de productos. */
  elegirProducto(producto: Producto): void {
    this.codigoProducto = producto.codProducto;
    this.cerrarModal('button-x');
    this.buscarProducto();
  }

  // ---------------------------------------------------------------- lineas

  agregarLinea(): void {
    if (!this.producto?.idProducto) {
      swal.fire('Producto no seleccionado', 'Busque un producto por su código antes de agregarlo.', 'warning');
      return;
    }

    const cantidad = Number(this.cantidad);
    const descuento = Number(this.descuento || 0);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      swal.fire('Cantidad inválida', 'La cantidad debe ser un número entero mayor a 0.', 'warning');
      return;
    }
    if (!Number.isFinite(descuento) || descuento < 0 || descuento > 100) {
      swal.fire('Descuento inválido', 'El descuento debe estar entre 0% y 100%.', 'warning');
      return;
    }

    const existente = this.lineas.find(l => l.producto.idProducto === this.producto.idProducto);
    const total = cantidad + (existente ? existente.cantidad : 0);
    if (total > this.producto.stock) {
      swal.fire('Stock insuficiente', `Solo hay ${this.producto.stock} unidades de este producto${existente ? ` (ya agregó ${existente.cantidad})` : ''}.`, 'warning');
      return;
    }

    if (existente) {
      existente.cantidad = total;
      existente.descuento = descuento;
      existente.recalcular();
    } else {
      const linea = new DetalleProforma();
      linea.producto = this.producto;
      linea.cantidad = cantidad;
      linea.descuento = descuento;
      linea.recalcular();
      this.lineas.push(linea);
    }

    this.producto = new Producto();
    this.codigoProducto = '';
    this.cantidad = null;
    this.descuento = 0;
    this.enfocar('codigo-producto');
  }

  /** Cambia la cantidad de una linea ya agregada, respetando las existencias. */
  cambiarCantidad(linea: DetalleProforma, valor: any): void {
    const cantidad = Number(valor);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      swal.fire('Cantidad inválida', 'La cantidad debe ser un número entero mayor a 0.', 'warning');
      return;
    }
    if (cantidad > linea.producto.stock) {
      swal.fire('Stock insuficiente', `Solo hay ${linea.producto.stock} unidades de este producto.`, 'warning');
      return;
    }
    linea.cantidad = cantidad;
    linea.recalcular();
  }

  cambiarDescuento(linea: DetalleProforma, valor: any): void {
    const descuento = Number(valor || 0);
    if (!Number.isFinite(descuento) || descuento < 0 || descuento > 100) {
      swal.fire('Descuento inválido', 'El descuento debe estar entre 0% y 100%.', 'warning');
      return;
    }
    linea.descuento = descuento;
    linea.recalcular();
  }

  quitarLinea(indice: number): void {
    this.lineas.splice(indice, 1);
  }

  // --------------------------------------------------------------- guardado

  guardar(): void {
    if (!this.puedeGuardar) {
      return;
    }
    this.guardando = true;

    // igual que en el comprobante de venta: un cliente nuevo (con datos escritos y sin id) se registra primero,
    // al guardar; si no se indico ningun cliente, la proforma se guarda sin cliente
    if (this.hayDatosDeClienteNuevo) {
      this.clienteService.create(this.cliente).subscribe(
        respuesta => {
          this.cliente = respuesta.cliente;
          this.guardarProforma();
        },
        () => this.guardando = false      // el servicio ya muestra el motivo
      );
    } else {
      this.guardarProforma();
    }
  }

  private guardarProforma(): void {
    const datos = new Proforma();
    datos.cliente = this.cliente?.idCliente ? this.cliente : null;
    datos.itemsProforma = this.lineas;

    const peticion = this.editando
      ? this.proformaService.update(this.idProforma, datos)
      : this.proformaService.create(datos);

    peticion.subscribe(
      respuesta => {
        this.guardando = false;
        const guardada: Proforma = respuesta.proforma;
        swal.fire({
          title: this.editando ? 'Proforma actualizada' : 'Proforma registrada',
          text: `Proforma No. ${guardada.noProforma} por Q${guardada.total.toFixed(2)}.`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Ver PDF',
          cancelButtonText: 'Ir al listado'
        }).then(resultado => {
          if (resultado.isConfirmed) {
            this.abrirPdf(guardada.idProforma);
          }
          this.router.navigate(['/proformas/index']);
        });
      },
      () => this.guardando = false      // el servicio ya muestra el motivo
    );
  }

  private abrirPdf(id: number): void {
    this.proformaService.getPdf(id).subscribe(pdf => {
      const url = window.URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    });
  }

  // ----------------------------------------------------------------- ayudas

  private enfocar(id: string): void {
    setTimeout(() => document.getElementById(id)?.focus(), 150);
  }

  /** Cierra un modal de Bootstrap (jQuery) pulsando su boton de cierre. */
  private cerrarModal(idBoton: string): void {
    document.getElementById(idBoton)?.click();
  }
}
