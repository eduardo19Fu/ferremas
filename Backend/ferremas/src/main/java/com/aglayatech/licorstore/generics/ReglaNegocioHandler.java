package com.aglayatech.licorstore.generics;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Convierte {@link ReglaNegocioException} en una respuesta JSON {@code {mensaje, error}} con el codigo HTTP
 * que lleve la excepcion (404, 409, 400...), para que los controladores no repitan el try/catch.
 */
@RestControllerAdvice
public class ReglaNegocioHandler {

	@ExceptionHandler(ReglaNegocioException.class)
	public ResponseEntity<Map<String, Object>> reglaDeNegocio(ReglaNegocioException e) {
		Map<String, Object> respuesta = new HashMap<>();
		respuesta.put("mensaje", e.getMessage());
		respuesta.put("error", e.getMessage());
		return new ResponseEntity<>(respuesta, e.getStatus());
	}
}
