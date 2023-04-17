import { Producto } from './producto';

export class DetalleFactura {
    idDetalle: number;
    cantidad = 1;
    subTotal: number;
    descuento: number;
    subTotalDescuento: number;
    precioUnitario: number;

    producto: Producto;

    public calcularImporte(): number{
        return this.producto.precioVenta * this.cantidad;

        // return this.producto.precioVenta * this.cantidad;
    }

    /**
     * Método que calcula el importe de la línea con base al segundo precio configurado
     * para el producto seleccionado
     * @returns Number
     * 
     */
    public calcularImporteSegundoPrecio(): number {
        return this.producto.segundoPrecio * this.cantidad;
    }

    public calcularPrecioDescuento(): number{
        return this.descuento <= 0 ? this.producto.precioVenta 
        : (Math.round(((this.producto.precioVenta - (this.producto.precioVenta * (this.descuento / 100))) + Number.EPSILON) * 100) / 100);
    }

    public calcularImporteDescuento(): number{
        return this.descuento <= 0 ? this.producto.precioVenta * this.cantidad
        // : (this.producto.precioVenta * this.cantidad) - ((this.descuento / 100) * (this.producto.precioVenta * this.cantidad));
        // : (Number((Math.abs((this.producto.precioVenta - (this.producto.precioVenta * (this.descuento / 100)))).toPrecision(15))) * this.cantidad);
        : (Math.round(((this.producto.precioVenta - (this.producto.precioVenta * (this.descuento / 100))) + Number.EPSILON) * 100) / 100) * this.cantidad;
    }
}
