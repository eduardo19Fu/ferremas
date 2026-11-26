/** Linea del detalle de una nota de credito tal como la sirve el listado paginado del backend. */
export interface DetalleNotaCreditoItem {
    idNotaDetalle: number;
    codProducto: string;
    nombreProducto: string;
    cantidad: number;
    descuento: number;
    subTotal: number;
    subTotalDescuento: number;
}
