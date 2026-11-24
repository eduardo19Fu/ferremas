import { Component, OnDestroy, OnInit } from '@angular/core';

import { ClienteService } from 'src/app/services/cliente.service';
import { FacturaService } from 'src/app/services/facturas/factura.service';
import { MovimientosProductoService } from 'src/app/services/movimientos/movimientos-producto.service';
import { ProductoService } from 'src/app/services/producto.service';
import { UsuarioService } from 'src/app/services/usuarios/usuario.service';
import { AuthService } from '../../services/auth.service';

import { Factura } from 'src/app/models/factura';
import { MovimientoProducto } from 'src/app/models/movimiento-producto';

const ADMIN = 'ROLE_ADMIN';
const COBRADOR = 'ROLE_COBRADOR';
const INVENTARIO = 'ROLE_INVENTARIO';

/** Indicador de la fila superior: conteo + enlace al listado. */
interface Indicador {
  etiqueta: string;
  icono: string;
  tono: 'accent' | 'green' | 'amber' | 'slate';
  ruta: string;
  enlace: string;
  roles: string[];
  valor?: number;
  mostrado: number;
}

/** Acceso rapido a una pantalla de registro. */
interface Acceso {
  etiqueta: string;
  descripcion: string;
  icono: string;
  ruta: string;
  roles: string[];
  principal?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  public title = 'Inicio';

  saludo = '';
  fechaHoy = '';

  indicadores: Indicador[] = [
    { etiqueta: 'Productos', icono: 'fa-box-open', tono: 'accent', ruta: '/productos/index', enlace: 'Ver todos',
      roles: [ADMIN, COBRADOR, INVENTARIO], mostrado: 0 },
    { etiqueta: 'Clientes', icono: 'fa-users', tono: 'green', ruta: '/clientes/index', enlace: 'Ver todos',
      roles: [ADMIN, COBRADOR], mostrado: 0 },
    { etiqueta: 'Ventas', icono: 'fa-receipt', tono: 'amber', ruta: '/facturas/index', enlace: 'Ver todas',
      roles: [ADMIN, COBRADOR], mostrado: 0 },
    { etiqueta: 'Usuarios', icono: 'fa-user-shield', tono: 'slate', ruta: '/usuarios/index', enlace: 'Ver todos',
      roles: [ADMIN], mostrado: 0 }
  ];

  accesos: Acceso[] = [
    { etiqueta: 'Nueva venta', descripcion: 'Facturar a un cliente', icono: 'fa-cash-register',
      ruta: '/facturas/create', roles: [ADMIN, COBRADOR], principal: true },
    { etiqueta: 'Nuevo cliente', descripcion: 'Registrar un cliente', icono: 'fa-user-plus',
      ruta: '/clientes/create', roles: [ADMIN, COBRADOR] },
    { etiqueta: 'Pago parcial', descripcion: 'Abonar a una nota de crédito', icono: 'fa-hand-holding-usd',
      ruta: '/pagos-parciales/create', roles: [ADMIN, COBRADOR] },
    { etiqueta: 'Nuevo producto', descripcion: 'Agregar al catálogo', icono: 'fa-plus-circle',
      ruta: '/productos/create', roles: [ADMIN, INVENTARIO] },
    { etiqueta: 'Nueva compra', descripcion: 'Ingresar mercadería', icono: 'fa-shopping-basket',
      ruta: '/compras/create', roles: [ADMIN, INVENTARIO] },
    { etiqueta: 'Movimiento', descripcion: 'Ajustar existencias', icono: 'fa-exchange-alt',
      ruta: '/productos/inventario/create', roles: [ADMIN, INVENTARIO] },
    { etiqueta: 'Nuevo envío', descripcion: 'Pedido a domicilio', icono: 'fa-truck',
      ruta: '/envios/create', roles: [ADMIN, INVENTARIO] },
    { etiqueta: 'Reportes', descripcion: 'Informes y pólizas', icono: 'fa-chart-line',
      ruta: '/reportes/main', roles: [ADMIN] }
  ];

  /** Ventas de hoy (sin anuladas): cantidad y total. null = aun cargando; false = no disponible. */
  ventasHoy: { cantidad: number; total: number; completo: boolean } | null | false = null;

  ultimasVentas: Factura[] | null = null;
  ultimosMovimientos: MovimientoProducto[] | null = null;
  errorVentas = false;
  errorMovimientos = false;

  private animaciones: number[] = [];

  constructor(
    private serviceProducto: ProductoService,
    private serviceCliente: ClienteService,
    private serviceUsuario: UsuarioService,
    private serviceFactura: FacturaService,
    private serviceMovimientos: MovimientosProductoService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.prepararCabecera();
    this.cargarIndicadores();

    if (this.puedeVerVentas) {
      this.cargarVentasHoy();
      this.cargarUltimasVentas();
    }
    if (this.puedeVerInventario) {
      this.cargarUltimosMovimientos();
    }
  }

  ngOnDestroy(): void {
    this.animaciones.forEach(id => cancelAnimationFrame(id));
  }

  // ---------------------------------------------------------------- permisos

  get puedeVerVentas(): boolean {
    return this.auth.hasRole(ADMIN) || this.auth.hasRole(COBRADOR);
  }

  get puedeVerInventario(): boolean {
    return this.auth.hasRole(ADMIN) || this.auth.hasRole(INVENTARIO);
  }

  get indicadoresVisibles(): Indicador[] {
    return this.indicadores.filter(i => this.tieneRol(i.roles));
  }

  get accesosVisibles(): Acceso[] {
    return this.accesos.filter(a => this.tieneRol(a.roles));
  }

  get nombre(): string {
    return this.auth.usuario?.primerNombre || this.auth.usuario?.usuario || '';
  }

  private tieneRol(roles: string[]): boolean {
    return roles.some(r => this.auth.hasRole(r));
  }

  // --------------------------------------------------------------- cabecera

  private prepararCabecera(): void {
    const hora = new Date().getHours();
    this.saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

    const fecha = new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });
    this.fechaHoy = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  }

  // ------------------------------------------------------------ indicadores

  private cargarIndicadores(): void {
    this.asignar('Productos', this.serviceProducto.getMaxProductos());
    this.asignar('Clientes', this.serviceCliente.getMaxClientes());
    this.asignar('Ventas', this.serviceFactura.getMaxVentas());
    this.asignar('Usuarios', this.serviceUsuario.getMaxUsuarios());
  }

  private asignar(etiqueta: string, fuente: any): void {
    const indicador = this.indicadores.find(i => i.etiqueta === etiqueta);
    if (!indicador || !this.tieneRol(indicador.roles)) {
      return;
    }
    fuente.subscribe((valor: number) => {
      indicador.valor = valor;
      this.contar(indicador, valor);
    }, () => indicador.valor = null);
  }

  /** Anima el numero de 0 al valor final (se omite con "reducir movimiento"). */
  private contar(indicador: Indicador, destino: number): void {
    const reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducir || destino <= 0) {
      indicador.mostrado = destino;
      return;
    }

    const duracion = 900;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min((ahora - inicio) / duracion, 1);
      const suave = 1 - Math.pow(1 - t, 3);                      // easeOutCubic
      indicador.mostrado = Math.round(destino * suave);
      if (t < 1) {
        this.animaciones.push(requestAnimationFrame(paso));
      }
    };
    this.animaciones.push(requestAnimationFrame(paso));
  }

  // ------------------------------------------------------------------ ventas

  private cargarVentasHoy(): void {
    const hoy = new Date();
    const manana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);

    // el filtro por fechas es [inicio, fin]: de hoy a mañana a las 00:00 cubre todo el dia
    this.serviceFactura.getPaginado(0, 100, '', this.iso(hoy) as any, this.iso(manana) as any).subscribe(
      page => {
        const vigentes = page.content.filter(f => !f.estado || f.estado.estado !== 'ANULADO');
        const completo = page.totalPages <= 1;
        this.ventasHoy = {
          cantidad: completo ? vigentes.length : page.totalElements,
          total: vigentes.reduce((suma, f) => suma + (f.total || 0), 0),
          completo
        };
      },
      () => this.ventasHoy = false
    );
  }

  private cargarUltimasVentas(): void {
    this.serviceFactura.getPaginado(0, 6).subscribe(
      page => this.ultimasVentas = page.content,
      () => { this.ultimasVentas = []; this.errorVentas = true; }
    );
  }

  // ------------------------------------------------------------- inventario

  private cargarUltimosMovimientos(): void {
    this.serviceMovimientos.getPaginado(0, 6).subscribe(
      page => this.ultimosMovimientos = page.content,
      () => { this.ultimosMovimientos = []; this.errorMovimientos = true; }
    );
  }

  /** Clase del chip segun el tipo de movimiento. */
  tonoMovimiento(movimiento: MovimientoProducto): string {
    const tipo = (movimiento.tipoMovimiento?.tipoMovimiento || '').toUpperCase();
    if (tipo.includes('VENTA') || tipo.includes('SALIDA')) {
      return 'hm-chip--amber';
    }
    if (tipo.includes('COMPRA') || tipo.includes('ENTRADA') || tipo.includes('INGRESO')) {
      return 'hm-chip--green';
    }
    return 'hm-chip--slate';
  }

  private iso(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }

  trackPorIndice(indice: number): number {
    return indice;
  }
}
