import { Producto } from './producto';

export class DetalleProforma {

    idDetalle: number;
    cantidad = 1;
    precioUnitario: number;
    descuento = 0;
    subTotal: number;
    subTotalDescuento: number;

    producto: Producto;

    /** Redondea a 2 decimales (mitad hacia arriba, igual que el servidor). */
    private static redondear(valor: number): number {
        return Math.round((valor + Number.EPSILON) * 100) / 100;
    }

    /** Importe de la linea sin descuento. */
    public calcularImporte(): number {
        return DetalleProforma.redondear(this.producto.precioVenta * this.cantidad);
    }

    /** Precio unitario con el descuento aplicado (se redondea el precio ya descontado, como en el servidor). */
    public calcularPrecioDescuento(): number {
        const precio = this.producto.precioVenta;
        return DetalleProforma.redondear(precio - precio * ((this.descuento || 0) / 100));
    }

    /** Importe de la linea con el descuento aplicado. */
    public calcularImporteDescuento(): number {
        return DetalleProforma.redondear(this.calcularPrecioDescuento() * this.cantidad);
    }

    /** Recalcula los importes de la linea a partir de producto, cantidad y descuento. */
    public recalcular(): void {
        this.precioUnitario = this.producto.precioVenta;
        this.subTotal = this.calcularImporte();
        this.subTotalDescuento = this.calcularImporteDescuento();
    }

    /** Crea una linea (con sus metodos) a partir del JSON que sirve el backend. */
    public static desde(json: any): DetalleProforma {
        const linea = new DetalleProforma();
        Object.assign(linea, json);
        linea.descuento = json.descuento || 0;
        return linea;
    }
}
