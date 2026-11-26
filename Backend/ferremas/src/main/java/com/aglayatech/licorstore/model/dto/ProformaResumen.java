package com.aglayatech.licorstore.model.dto;

import java.util.Date;

/**
 * Fila del listado de proformas, en forma plana. {@code noFactura} trae el numero de la factura vigente que
 * convirtio la proforma (null si aun no se ha facturado).
 */
public record ProformaResumen(
		Long idProforma,
		Long noProforma,
		Date fechaEmision,
		String cliente,
		String nit,
		String vendedor,
		Double total,
		String estado,
		Long noFactura) {
}
