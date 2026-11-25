package com.aglayatech.licorstore.model.dto;

/**
 * Linea del detalle de una compra, en forma plana (sin cargar el producto completo con sus relaciones).
 * Se usa en el listado paginado del detalle que muestra el modal de la compra.
 */
public record DetalleCompraItem(
		Integer idDetalleCompra,
		String codProducto,
		String nombreProducto,
		Integer cantidad,
		Double precioUnitario,
		Double subTotal) {
}
