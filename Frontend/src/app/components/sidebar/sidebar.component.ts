import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

import { Usuario } from '../../models/usuario';

const ADMIN = 'ROLE_ADMIN';
const COBRADOR = 'ROLE_COBRADOR';
const INVENTARIO = 'ROLE_INVENTARIO';

/** Elemento del menu: un enlace, o un grupo con `hijos`. */
export interface ItemMenu {
  etiqueta: string;
  icono?: string;
  ruta?: string;
  /** Roles que lo ven. Sin definir = todos. */
  roles?: string[];
  /** Grupo: se considera activo (y se abre) cuando la URL empieza con este prefijo. */
  prefijo?: string;
  /** Grupo: prefijos de URL que NO cuentan para este grupo. */
  excluir?: string[];
  hijos?: ItemMenu[];
}

export interface SeccionMenu {
  titulo?: string;
  /** Roles que ven el titulo de la seccion. Sin definir = todos. */
  rolesTitulo?: string[];
  items: ItemMenu[];
}

/** Estructura del menu lateral: unica fuente de verdad de rutas, iconos y permisos. */
const MENU: SeccionMenu[] = [
  {
    titulo: 'Productos e Inventario', rolesTitulo: [INVENTARIO, ADMIN],
    items: [
      {
        etiqueta: 'Productos', icono: 'fa-box-open', prefijo: '/productos', excluir: ['/productos/inventario'],
        hijos: [
          { etiqueta: 'Listado', ruta: '/productos/index', roles: [INVENTARIO, ADMIN, COBRADOR] },
          { etiqueta: 'Marcas', ruta: '/productos/marcas/index', roles: [INVENTARIO, ADMIN] },
          { etiqueta: 'Categorías', ruta: '/productos/categorias/index', roles: [INVENTARIO, ADMIN] }
        ]
      },
      { etiqueta: 'Movimientos', icono: 'fa-warehouse', ruta: '/productos/inventario/index', roles: [ADMIN, INVENTARIO] }
    ]
  },
  {
    titulo: 'Ventas', rolesTitulo: [COBRADOR, ADMIN],
    items: [
      {
        etiqueta: 'Facturas', icono: 'fa-file-invoice-dollar', prefijo: '/facturas', roles: [COBRADOR, ADMIN],
        hijos: [
          { etiqueta: 'Facturas emitidas', ruta: '/facturas/index' },
          { etiqueta: 'Correlativos', ruta: '/facturas/correlativos/index', roles: [ADMIN] }
        ]
      },
      {
        etiqueta: 'Proformas', icono: 'fa-file-signature', prefijo: '/proformas', roles: [COBRADOR, ADMIN],
        hijos: [
          { etiqueta: 'Listado', ruta: '/proformas/index' },
          { etiqueta: 'Nueva', ruta: '/proformas/create' }
        ]
      }
    ]
  },
  {
    titulo: 'Compras', rolesTitulo: [ADMIN, INVENTARIO],
    items: [
      {
        etiqueta: 'Compras', icono: 'fa-shopping-basket', prefijo: '/compras', roles: [ADMIN, INVENTARIO],
        hijos: [
          { etiqueta: 'Ingresar compra', ruta: '/compras/create' },
          { etiqueta: 'Listado', ruta: '/compras/index' }
        ]
      },
      {
        etiqueta: 'Proveedores', icono: 'fa-people-carry', prefijo: '/proveedores', roles: [ADMIN, INVENTARIO],
        hijos: [
          { etiqueta: 'Registrar', ruta: '/proveedores/create' },
          { etiqueta: 'Listado', ruta: '/proveedores/index', roles: [ADMIN] }
        ]
      },
      {
        etiqueta: 'Países', icono: 'fa-globe-americas', prefijo: '/paises', roles: [ADMIN, INVENTARIO],
        hijos: [{ etiqueta: 'Listado', ruta: '/paises/index' }]
      }
    ]
  },
  {
    titulo: 'Notas de Crédito', rolesTitulo: [ADMIN, INVENTARIO],
    items: [
      {
        etiqueta: 'Notas de crédito', icono: 'fa-credit-card', prefijo: '/notas-credito', roles: [ADMIN, INVENTARIO],
        hijos: [
          { etiqueta: 'Listado', ruta: '/notas-credito/index' },
          { etiqueta: 'Crear', ruta: '/notas-credito/create' }
        ]
      },
      {
        etiqueta: 'Pagos parciales', icono: 'fa-hand-holding-usd', prefijo: '/pagos-parciales', roles: [ADMIN, INVENTARIO],
        hijos: [
          { etiqueta: 'Listado', ruta: '/pagos-parciales/index' },
          { etiqueta: 'Crear', ruta: '/pagos-parciales/create' }
        ]
      }
    ]
  },
  {
    titulo: 'Clientes', rolesTitulo: [COBRADOR, ADMIN],
    items: [
      { etiqueta: 'Clientes', icono: 'fa-address-book', ruta: '/clientes/index', prefijo: '/clientes', roles: [COBRADOR, ADMIN] }
    ]
  },
  {
    titulo: 'Usuarios y Permisos', rolesTitulo: [ADMIN],
    items: [
      { etiqueta: 'Usuarios', icono: 'fa-users', ruta: '/usuarios/index', prefijo: '/usuarios', roles: [ADMIN] }
    ]
  },
  {
    titulo: 'Reportes',
    items: [
      { etiqueta: 'Reportes', icono: 'fa-chart-line', ruta: '/reportes/main' }
    ]
  }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  usuario: Usuario;

  /** Texto del buscador del menu. */
  filtro = '';

  /** Menu ya filtrado por rol y por busqueda. */
  vista: SeccionMenu[] = [];

  private abiertos = new Set<string>();
  private suscripcion: Subscription;

  constructor(
    public router: Router,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('usuario') != null) {
      this.usuario = this.authService.usuario;
    }

    this.abrirGrupoActual();
    this.actualizar();

    // al navegar se abre el grupo de la ruta actual (sin cerrar los demas)
    this.suscripcion = this.router.events
      .pipe(filter(evento => evento instanceof NavigationEnd))
      .subscribe(() => this.abrirGrupoActual());
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  // ---------------------------------------------------------------- usuario

  get nombreCompleto(): string {
    return this.usuario ? `${this.usuario.primerNombre || ''} ${this.usuario.apellido || ''}`.trim() : '';
  }

  get iniciales(): string {
    if (!this.usuario) {
      return '';
    }
    const inicial = (texto: string) => (texto || '').trim().charAt(0).toUpperCase();
    return (inicial(this.usuario.primerNombre) + inicial(this.usuario.apellido)) || inicial(this.usuario.usuario);
  }

  get rolEtiqueta(): string {
    if (this.authService.hasRole(ADMIN)) {
      return 'Administrador';
    }
    const roles: string[] = [];
    if (this.authService.hasRole(INVENTARIO)) { roles.push('Inventario'); }
    if (this.authService.hasRole(COBRADOR)) { roles.push('Cobrador'); }
    return roles.join(' · ');
  }

  // ------------------------------------------------------------------- menu

  private visiblePorRol(roles?: string[]): boolean {
    return !roles || roles.some(r => this.authService.hasRole(r));
  }

  private coincide(texto: string, consulta: string): boolean {
    const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    return normalizar(texto).includes(normalizar(consulta));
  }

  /** Recalcula el menu visible (permisos + busqueda). */
  actualizar(): void {
    const consulta = this.filtro.trim();
    const resultado: SeccionMenu[] = [];

    for (const seccion of MENU) {
      const items: ItemMenu[] = [];

      for (const item of seccion.items) {
        if (!this.visiblePorRol(item.roles)) {
          continue;
        }

        if (!item.hijos) {
          if (!consulta || this.coincide(item.etiqueta, consulta)) {
            items.push(item);
          }
          continue;
        }

        const hijos = item.hijos.filter(h => this.visiblePorRol(h.roles));
        if (!hijos.length) {
          continue;
        }

        if (!consulta) {
          items.push({ ...item, hijos });
        } else if (this.coincide(item.etiqueta, consulta)) {
          items.push({ ...item, hijos });                                   // el grupo coincide: se muestra completo
        } else {
          const coinciden = hijos.filter(h => this.coincide(h.etiqueta, consulta));
          if (coinciden.length) {
            items.push({ ...item, hijos: coinciden });
          }
        }
      }

      if (items.length) {
        const titulo = this.visiblePorRol(seccion.rolesTitulo) ? seccion.titulo : undefined;
        resultado.push({ titulo, items });
      }
    }

    this.vista = resultado;
  }

  limpiar(): void {
    this.filtro = '';
    this.actualizar();
  }

  get sinResultados(): boolean {
    return !!this.filtro.trim() && this.vista.length === 0;
  }

  // ------------------------------------------------------------------ grupos

  /** Con busqueda activa todos los grupos se muestran abiertos. */
  estaAbierto(item: ItemMenu): boolean {
    return !!this.filtro.trim() || this.abiertos.has(item.etiqueta);
  }

  alternar(item: ItemMenu, evento: Event): void {
    evento.preventDefault();
    if (this.abiertos.has(item.etiqueta)) {
      this.abiertos.delete(item.etiqueta);
    } else {
      this.abiertos.add(item.etiqueta);
    }
  }

  /** El grupo (o enlace con prefijo) corresponde a la URL actual. */
  esActivo(item: ItemMenu): boolean {
    const url = this.router.url;
    if (!item.prefijo || !url.startsWith(item.prefijo)) {
      return false;
    }
    return !(item.excluir || []).some(e => url.startsWith(e));
  }

  private abrirGrupoActual(): void {
    for (const seccion of MENU) {
      for (const item of seccion.items) {
        if (item.hijos && this.esActivo(item)) {
          this.abiertos.add(item.etiqueta);
        }
      }
    }
  }

  trackPorEtiqueta(_: number, elemento: { etiqueta: string }): string {
    return elemento.etiqueta;
  }
}
