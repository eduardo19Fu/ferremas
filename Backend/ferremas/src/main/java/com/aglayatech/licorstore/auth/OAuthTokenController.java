package com.aglayatech.licorstore.auth;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aglayatech.licorstore.model.Usuario;
import com.aglayatech.licorstore.service.IUsuarioService;

/**
 * Endpoint de emision de tokens, compatible con el contrato del servidor OAuth2 anterior:
 * {@code POST /oauth/token} con credenciales de cliente (Basic) y grant_type {@code password}
 * o {@code refresh_token}. Los errores usan el mismo formato ({@code error}, {@code error_description}).
 */
@RestController
public class OAuthTokenController {

	private static final Logger logger = LoggerFactory.getLogger(OAuthTokenController.class);

	private final AuthenticationManager authenticationManager;
	private final UserDetailsService userDetailsService;
	private final IUsuarioService usuarioService;
	private final TokenService tokenService;
	private final AuthProperties props;
	private final NimbusJwtDecoder refreshDecoder;

	public OAuthTokenController(AuthenticationManager authenticationManager, UserDetailsService userDetailsService,
			IUsuarioService usuarioService, TokenService tokenService, AuthProperties props, KeyPair keyPair) {
		this.authenticationManager = authenticationManager;
		this.userDetailsService = userDetailsService;
		this.usuarioService = usuarioService;
		this.tokenService = tokenService;
		this.props = props;
		this.refreshDecoder = JwtKeyConfig.decoder(keyPair, TokenService.REFRESH);
	}

	@PostMapping(value = "/oauth/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	public ResponseEntity<Map<String, Object>> token(
			@RequestHeader(value = "Authorization", required = false) String authorization,
			@RequestParam Map<String, String> params) {

		if (!clienteValido(authorization)) {
			return error(HttpStatus.UNAUTHORIZED, "invalid_client", "Credenciales de cliente invalidas");
		}

		String grantType = params.get("grant_type");
		if ("password".equals(grantType)) {
			return passwordGrant(params.get("username"), params.get("password"));
		}
		if ("refresh_token".equals(grantType)) {
			return refreshGrant(params.get("refresh_token"));
		}
		return error(HttpStatus.BAD_REQUEST, "unsupported_grant_type", "Tipo de grant no soportado: " + grantType);
	}

	private ResponseEntity<Map<String, Object>> passwordGrant(String username, String password) {
		if (username == null || password == null) {
			return error(HttpStatus.BAD_REQUEST, "invalid_request", "Faltan username y/o password");
		}
		try {
			Authentication auth = authenticationManager
					.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(username, password));
			Usuario usuario = usuarioService.findByUsuario(auth.getName());
			return ResponseEntity.ok(tokenService.issue(usuario, List.copyOf(auth.getAuthorities())));
		} catch (DisabledException e) {
			return error(HttpStatus.BAD_REQUEST, "invalid_grant", "User is disabled");
		} catch (AuthenticationException e) {
			// Mismo codigo (400) que el servidor anterior: el frontend lo interpreta como credenciales incorrectas
			return error(HttpStatus.BAD_REQUEST, "invalid_grant", "Bad credentials");
		}
	}

	private ResponseEntity<Map<String, Object>> refreshGrant(String refreshToken) {
		if (refreshToken == null) {
			return error(HttpStatus.BAD_REQUEST, "invalid_request", "Falta refresh_token");
		}
		try {
			Jwt jwt = refreshDecoder.decode(refreshToken);
			// Se vuelve a leer el usuario: refleja cambios de roles y usuarios deshabilitados
			UserDetails user = userDetailsService.loadUserByUsername(jwt.getSubject());
			if (!user.isEnabled()) {
				return error(HttpStatus.BAD_REQUEST, "invalid_grant", "User is disabled");
			}
			Usuario usuario = usuarioService.findByUsuario(user.getUsername());
			return ResponseEntity.ok(tokenService.issue(usuario, List.copyOf(user.getAuthorities())));
		} catch (JwtException | UsernameNotFoundException e) {
			logger.debug("Refresh token rechazado: {}", e.getMessage());
			return error(HttpStatus.BAD_REQUEST, "invalid_grant", "Invalid refresh token");
		}
	}

	/** Valida el encabezado Basic contra el cliente configurado (comparacion en tiempo constante). */
	private boolean clienteValido(String authorization) {
		if (authorization == null || !authorization.regionMatches(true, 0, "Basic ", 0, 6)
				|| props.clientSecret() == null) {
			return false;
		}
		try {
			String decoded = new String(Base64.getDecoder().decode(authorization.substring(6).trim()),
					StandardCharsets.UTF_8);
			int i = decoded.indexOf(':');
			if (i < 0) {
				return false;
			}
			boolean id = MessageDigest.isEqual(decoded.substring(0, i).getBytes(StandardCharsets.UTF_8),
					props.clientId().getBytes(StandardCharsets.UTF_8));
			boolean secret = MessageDigest.isEqual(decoded.substring(i + 1).getBytes(StandardCharsets.UTF_8),
					props.clientSecret().getBytes(StandardCharsets.UTF_8));
			return id && secret;
		} catch (IllegalArgumentException e) {
			return false;
		}
	}

	private ResponseEntity<Map<String, Object>> error(HttpStatus status, String error, String description) {
		return ResponseEntity.status(status).body(Map.of("error", error, "error_description", description));
	}
}
