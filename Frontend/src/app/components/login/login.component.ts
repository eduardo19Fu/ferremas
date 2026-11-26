import { Component, OnInit } from '@angular/core';

import { Usuario } from 'src/app/models/usuario';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  title: string;
  usuarioTitle: string;
  passwordTitle: string;

  usuario: Usuario;

  /** true mientras se espera la respuesta del servidor. */
  cargando = false;
  /** Muestra la contraseña en texto plano. */
  verPassword = false;
  /** Mensaje de error visible bajo el formulario (vacío = sin error). */
  error = '';

  constructor(
    private authService: AuthService
  ) {
    this.title = 'Bienvenido';
    this.usuarioTitle = 'Usuario';
    this.passwordTitle = 'Contraseña';
    this.usuario = new Usuario();
  }

  ngOnInit(): void {
    this.authService.logout();
  }

  login(): void {
    if (this.cargando) {
      return;
    }

    this.error = '';

    if (!this.usuario.usuario || !this.usuario.usuario.trim() || !this.usuario.password) {
      this.error = 'Ingresa tu usuario y tu contraseña.';
      return;
    }

    this.cargando = true;

    this.authService.login(this.usuario).subscribe(
      response => {
        this.authService.guardarUsuario(response.access_token);
        this.authService.guardarToken(response.access_token);

        window.location.href = '/sitio/home';
      },
      error => {
        this.cargando = false;

        if (error.status === 400) {
          this.error = 'Usuario y/o contraseña incorrectos.';
        } else if (error.status === 0) {
          this.error = 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
        } else {
          this.error = 'Ocurrió un problema al iniciar sesión. Inténtalo de nuevo.';
        }
      }
    );
  }

}
