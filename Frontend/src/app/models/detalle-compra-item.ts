/** Linea del detalle de una compra tal como la sirve el listado paginado del backend. */
export interface DetalleCompraItem {
    idDetalleCompra: number;
    codProducto: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subTotal: number;
}
