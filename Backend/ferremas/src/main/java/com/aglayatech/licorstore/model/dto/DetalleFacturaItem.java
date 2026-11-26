package com.aglayatech.licorstore.model.dto;

/**
 * Linea del detalle de una factura, en forma plana (sin cargar el producto completo con sus relaciones).
 * Se usa en el listado paginado del detalle que muestra el modal de la factura.
 */
public record DetalleFacturaItem(
		Long idDetalle,
		String codProducto,
		String nombreProducto,
		Integer cantidad,
		Double precioUnitario,
		Double subTotal,
		Double descuento,
		Double subTotalDescuento) {
}
