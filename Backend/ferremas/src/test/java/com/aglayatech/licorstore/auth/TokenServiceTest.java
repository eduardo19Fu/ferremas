package com.aglayatech.licorstore.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.security.KeyPair;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;

import com.aglayatech.licorstore.model.Usuario;

/** Emision de tokens: claims que consume el frontend y manejo de datos opcionales nulos. */
class TokenServiceTest {

	private final AuthProperties props = new AuthProperties("angularapp", "secreto", Duration.ofHours(12),
			Duration.ofDays(30), null, null);

	private Map<String, Object> emitir(KeyPair keyPair, Usuario usuario) {
		TokenService service = new TokenService(new JwtKeyConfig().jwtEncoder(keyPair), props);
		return service.issue(usuario, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
	}

	private Usuario usuario(String segundoNombre) {
		Usuario u = new Usuario();
		u.setIdUsuario(7);
		u.setUsuario("admin");
		u.setPrimerNombre("Ana");
		u.setSegundoNombre(segundoNombre);
		u.setApellido("Perez");
		return u;
	}

	@Test
	void emiteTokenCuandoElUsuarioNoTieneSegundoNombre() throws Exception {
		KeyPair keyPair = new JwtKeyConfig().jwtKeyPair(props);
		Map<String, Object> respuesta = emitir(keyPair, usuario(null));

		Jwt access = JwtKeyConfig.decoder(keyPair, TokenService.ACCESS).decode((String) respuesta.get("access_token"));
		assertEquals("admin", access.getClaim("user_name"));
		assertEquals(List.of("ROLE_ADMIN"), access.getClaim("authorities"));
		assertEquals("7", access.getClaim("id_usuario"));
		assertEquals("Ana", access.getClaim("primerNombre"));
		assertNull(access.getClaim("segundoNombre"));
	}

	@Test
	void elTokenDeRefrescoNoSirveComoTokenDeAcceso() throws Exception {
		KeyPair keyPair = new JwtKeyConfig().jwtKeyPair(props);
		Map<String, Object> respuesta = emitir(keyPair, usuario("Maria"));

		assertThrows(JwtException.class,
				() -> JwtKeyConfig.decoder(keyPair, TokenService.ACCESS).decode((String) respuesta.get("refresh_token")));
	}
}
