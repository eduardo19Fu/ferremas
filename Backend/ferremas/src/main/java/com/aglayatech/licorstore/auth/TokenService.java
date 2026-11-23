package com.aglayatech.licorstore.auth;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.aglayatech.licorstore.model.Usuario;

/**
 * Emite los tokens de acceso y de refresco (JWT firmados con RSA).
 * Mantiene los mismos claims que el servidor OAuth2 anterior, de los que depende el frontend:
 * user_name, authorities, id_usuario, primerNombre, segundoNombre y apellido.
 */
@Service
public class TokenService {

	public static final String TOKEN_USE = "token_use";
	public static final String ACCESS = "access";
	public static final String REFRESH = "refresh";
	private static final List<String> SCOPES = List.of("read", "write");

	private final JwtEncoder encoder;
	private final AuthProperties props;

	public TokenService(JwtEncoder encoder, AuthProperties props) {
		this.encoder = encoder;
		this.props = props;
	}

	public Map<String, Object> issue(Usuario usuario, List<? extends GrantedAuthority> authorities) {
		Instant now = Instant.now();
		List<String> roles = authorities.stream().map(GrantedAuthority::getAuthority).toList();

		JwtClaimsSet.Builder accessClaims = JwtClaimsSet.builder()
				.subject(usuario.getUsuario())
				.issuedAt(now)
				.expiresAt(now.plus(props.accessTokenTtl()))
				.id(UUID.randomUUID().toString())
				.claim(TOKEN_USE, ACCESS)
				.claim("client_id", props.clientId())
				.claim("scope", SCOPES)
				.claim("user_name", usuario.getUsuario())
				.claim("authorities", roles)
				.claim("id_usuario", usuario.getIdUsuario().toString());
		// JwtClaimsSet no admite valores nulos: los datos opcionales (p. ej. segundoNombre) solo se agregan si existen
		claimIfPresent(accessClaims, "primerNombre", usuario.getPrimerNombre());
		claimIfPresent(accessClaims, "segundoNombre", usuario.getSegundoNombre());
		claimIfPresent(accessClaims, "apellido", usuario.getApellido());
		String access = encode(accessClaims.build());

		String refresh = encode(JwtClaimsSet.builder()
				.subject(usuario.getUsuario())
				.issuedAt(now)
				.expiresAt(now.plus(props.refreshTokenTtl()))
				.id(UUID.randomUUID().toString())
				.claim(TOKEN_USE, REFRESH)
				.claim("client_id", props.clientId())
				.claim("user_name", usuario.getUsuario())
				.build());

		// Misma forma de respuesta que el endpoint /oauth/token anterior
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("access_token", access);
		body.put("token_type", "bearer");
		body.put("refresh_token", refresh);
		body.put("expires_in", props.accessTokenTtl().toSeconds());
		body.put("scope", String.join(" ", SCOPES));
		body.put("id_usuario", usuario.getIdUsuario().toString());
		body.put("primerNombre", usuario.getPrimerNombre());
		body.put("segundoNombre", usuario.getSegundoNombre());
		body.put("apellido", usuario.getApellido());
		return body;
	}

	private static void claimIfPresent(JwtClaimsSet.Builder builder, String name, String value) {
		if (value != null) {
			builder.claim(name, value);
		}
	}

	private String encode(JwtClaimsSet claims) {
		JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256).build();
		return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}
}
