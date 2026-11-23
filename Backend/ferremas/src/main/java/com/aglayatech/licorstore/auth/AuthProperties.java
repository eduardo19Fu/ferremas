package com.aglayatech.licorstore.auth;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.core.io.Resource;

/**
 * Configuracion de autenticacion (prefijo {@code ferremas.auth}).
 *
 * <p>Las claves RSA se leen de archivos PEM ({@code private-key}: PKCS#8, {@code public-key}: X.509).
 * Si no se configuran, se genera un par efimero al arrancar (solo desarrollo: los tokens dejan de
 * ser validos al reiniciar).</p>
 */
@ConfigurationProperties(prefix = "ferremas.auth")
public record AuthProperties(
		@DefaultValue("angularapp") String clientId,
		String clientSecret,
		@DefaultValue("12h") Duration accessTokenTtl,
		@DefaultValue("30d") Duration refreshTokenTtl,
		Resource privateKey,
		Resource publicKey) {
}
