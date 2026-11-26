/** Fila del listado de proformas tal como la sirve el backend. */
export interface ProformaResumen {
    idProforma: number;
    noProforma: number;
    fechaEmision: string;
    cliente: string;
    nit: string;
    vendedor: string;
    total: number;
    estado: string;
    /** Numero de la factura vigente que convirtio la proforma (null si aun no se factura). */
    noFactura: number | null;
}

/** Linea del detalle de una proforma tal como la sirve el listado paginado del backend. */
export interface DetalleProformaItem {
    idDetalle: number;
    codProducto: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    subTotal: number;
    subTotalDescuento: number;
}
