/** Linea del detalle de una factura tal como la sirve el listado paginado del backend. */
export interface DetalleFacturaItem {
    idDetalle: number;
    codProducto: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subTotal: number;
    descuento: number;
    subTotalDescuento: number;
}
