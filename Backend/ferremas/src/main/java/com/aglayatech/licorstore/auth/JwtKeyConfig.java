package com.aglayatech.licorstore.auth;

import java.io.IOException;
import java.io.InputStream;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.converter.RsaKeyConverters;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;

/** Claves RSA y codificador/decodificador de JWT. */
@Configuration
public class JwtKeyConfig {

	private static final Logger logger = LoggerFactory.getLogger(JwtKeyConfig.class);

	@Bean
	public KeyPair jwtKeyPair(AuthProperties props) throws IOException, NoSuchAlgorithmException {
		if (props.privateKey() != null && props.publicKey() != null) {
			try (InputStream priv = props.privateKey().getInputStream();
					InputStream pub = props.publicKey().getInputStream()) {
				RSAPrivateKey privateKey = RsaKeyConverters.pkcs8().convert(priv);
				RSAPublicKey publicKey = RsaKeyConverters.x509().convert(pub);
				return new KeyPair(publicKey, privateKey);
			}
		}

		logger.warn("No se configuraron ferremas.auth.private-key / public-key: se genera un par de claves RSA "
				+ "EFIMERO. Los tokens dejaran de ser validos al reiniciar. Configure claves PEM en produccion.");
		KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
		generator.initialize(2048);
		return generator.generateKeyPair();
	}

	@Bean
	public JwtEncoder jwtEncoder(KeyPair keyPair) {
		RSAKey jwk = new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
				.privateKey((RSAPrivateKey) keyPair.getPrivate())
				.keyID(UUID.randomUUID().toString())
				.build();
		return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(jwk)));
	}

	/**
	 * Decodificador usado por el Resource Server: valida firma, vigencia y que el token sea de ACCESO
	 * (un token de refresco no sirve para llamar a la API).
	 */
	@Bean
	public JwtDecoder jwtDecoder(KeyPair keyPair) {
		return decoder(keyPair, TokenService.ACCESS);
	}

	/** Construye un decodificador que exige un tipo de token concreto (access / refresh). */
	public static NimbusJwtDecoder decoder(KeyPair keyPair, String tokenUse) {
		NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey((RSAPublicKey) keyPair.getPublic()).build();
		OAuth2TokenValidator<Jwt> tipo = new JwtClaimValidator<String>(TokenService.TOKEN_USE, tokenUse::equals);
		decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), tipo));
		return decoder;
	}
}
