import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../../models/usuario';
import { global } from '../global';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Role } from '../../models/role';

import swal from 'sweetalert2';
import { UsuarioAuxiliar } from '../../models/auxiliar/usuario-auxiliar';
import { Page } from 'src/app/models/page';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private url: string;

  constructor(
    private http: HttpClient
  ) {
    this.url = global.url;
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.url}/usuarios`);
  }

  getUsuarioPage(page: number): Observable<any> {
    return this.http.get<any>(`${this.url}/usuarios/page/${page}`).pipe(
      map((response: any) => {
        (response.content as Usuario[]).map(usuario => {
          usuario.primerNombre = usuario.primerNombre.toUpperCase();
          usuario.apellido = usuario.apellido.toUpperCase();
          if (usuario.segundoNombre != null){
            usuario.segundoNombre = usuario.segundoNombre.toUpperCase();
          }
          return usuario;
        });
        return response;
      })
    );
  }

  getCajeros(): Observable<Usuario[]>{
    return this.http.get<Usuario[]>(`${this.url}/usuarios/cajero`);
  }

  getUsuario(id: number): Observable<UsuarioAuxiliar> {
    return this.http.get<UsuarioAuxiliar>(`${this.url}/usuarios/${id}`).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  getMaxUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.url}/usuarios/max-usuarios/get`).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  create(usuario: UsuarioAuxiliar): Observable<any> {
    return this.http.post<any>(`${this.url}/usuarios`, usuario).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  update(usuario: UsuarioAuxiliar): Observable<any> {
    return this.http.put<any>(`${this.url}/usuarios/${usuario.idUsuario}`, usuario).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<any>{
    return this.http.delete<any>(`${this.url}/usuarios/${id}`).pipe(
      catchError(e => {
        swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  // Servicio que se comunica con el controlador y devuelve el listado de roles de la bd
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.url}/roles`).pipe(
      catchError(e => {
        return throwError(e);
      })
    );
  }

  /** Listado paginado desde el backend, con busqueda opcional. */
  getPaginado(page: number, size: number, search: string = ''): Observable<Page<Usuario>> {
    const params: any = { page: String(page), size: String(size) };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    return this.http.get<Page<Usuario>>(`${this.url}/usuarios/paginado`, { params });
  }
}
