package com.aglayatech.licorstore.model.dto;

/** Linea del detalle de una proforma, en forma plana, para el listado paginado del modal de detalle. */
public record DetalleProformaItem(
		Long idDetalle,
		String codProducto,
		String nombreProducto,
		Integer cantidad,
		Double precioUnitario,
		Float descuento,
		Double subTotal,
		Double subTotalDescuento) {
}
