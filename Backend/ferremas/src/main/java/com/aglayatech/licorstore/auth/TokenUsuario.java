package com.aglayatech.licorstore.auth;

import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Lectura del usuario autenticado a partir de los claims del token. El claim {@code id_usuario} lo emite
 * {@link TokenService} como texto ("4"), pero se acepta tambien como numero para no depender del formato.
 */
public final class TokenUsuario {

	private TokenUsuario() {
	}

	/** Id del usuario del token, o null si el token no lo trae o no es valido. */
	public static Integer idUsuario(Jwt jwt) {
		if (jwt == null) {
			return null;
		}
		Object claim = jwt.getClaim("id_usuario");
		if (claim instanceof Number) {
			return ((Number) claim).intValue();
		}
		if (claim instanceof String) {
			try {
				return Integer.valueOf(((String) claim).trim());
			} catch (NumberFormatException e) {
				return null;
			}
		}
		return null;
	}
}
