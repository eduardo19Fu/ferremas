package com.aglayatech.licorstore.generics;

import org.springframework.http.HttpStatus;

/**
 * Se lanza cuando una operacion no puede realizarse por una regla del negocio (p. ej. anular una nota ya anulada).
 * Lleva el codigo HTTP que debe devolver el API.
 */
public class ReglaNegocioException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	private final HttpStatus status;

	public ReglaNegocioException(HttpStatus status, String mensaje) {
		super(mensaje);
		this.status = status;
	}

	public HttpStatus getStatus() {
		return status;
	}
}
