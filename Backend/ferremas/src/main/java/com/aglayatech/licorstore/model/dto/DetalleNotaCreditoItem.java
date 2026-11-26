package com.aglayatech.licorstore.model.dto;

/**
 * Linea del detalle de una nota de credito, en forma plana (sin cargar el producto completo con sus relaciones).
 * Se usa en el listado paginado del detalle que muestra el modal de la nota.
 */
public record DetalleNotaCreditoItem(
		Integer idNotaDetalle,
		String codProducto,
		String nombreProducto,
		Integer cantidad,
		Double descuento,
		Double subTotal,
		Double subTotalDescuento) {
}
