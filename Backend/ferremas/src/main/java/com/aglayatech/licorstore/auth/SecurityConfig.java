package com.aglayatech.licorstore.auth;

import java.util.Arrays;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Seguridad de la API: Resource Server JWT (sin estado). Reemplaza a las antiguas
 * {@code ResourceServerConfig}, {@code AuthorizationServerConfig} y {@code SpringSecurityConfig}.
 * Las reglas de acceso son equivalentes a las anteriores.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
@EnableConfigurationProperties(AuthProperties.class)
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.csrf(AbstractHttpConfigurer::disable)
			.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.cors(Customizer.withDefaults())
			.authorizeHttpRequests(auth -> auth
				// emision de tokens (autentica el propio controlador con las credenciales del cliente)
				.requestMatchers(HttpMethod.POST, "/oauth/token").permitAll()
				.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
				// despacho interno de errores: sin esto un 500 se ve como 401 y oculta la causa real
				.requestMatchers("/error").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/productos", "/api/productos/page/**", "/api/uploads/img/**", "/images/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/clientes", "/api/clientes/{id}", "/api/clientes/page/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/marcas", "/api/marcas/page/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/tipos-producto", "/api/tipos-producto/page/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/roles", "/api/roles/page/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/facturas/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/correlativos", "/api/correlativos/page/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/movimientos", "/api/movimientos/**").permitAll()
				.anyRequest().authenticated())
			.oauth2ResourceServer(oauth -> oauth
				.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
		return http.build();
	}

	/**
	 * Los roles viajan en el claim "authorities" ya con el prefijo ROLE_ (p. ej. ROLE_ADMIN),
	 * por lo que no se agrega ningun prefijo adicional.
	 */
	@Bean
	public JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
		authorities.setAuthoritiesClaimName("authorities");
		authorities.setAuthorityPrefix("");

		JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
		converter.setJwtGrantedAuthoritiesConverter(authorities);
		converter.setPrincipalClaimName("user_name");
		return converter;
	}

	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/** Autenticacion usuario/contrasena contra {@code UsuarioServiceImpl} (usado por /oauth/token). */
	@Bean
	public AuthenticationManager authenticationManager(UserDetailsService usuarioService,
			BCryptPasswordEncoder passwordEncoder) {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider(usuarioService);
		provider.setPasswordEncoder(passwordEncoder);
		return new ProviderManager(provider);
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOriginPatterns(Arrays.asList("*"));
		config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		config.setAllowCredentials(true);
		config.setAllowedHeaders(Arrays.asList("Content-Type", "Authorization"));

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}
}
