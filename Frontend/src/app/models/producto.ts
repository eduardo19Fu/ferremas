import { Estado } from './estado';
import { MarcaProducto } from './marca-producto';
import { TipoProducto } from './tipo-producto';

export class Producto {
    idProducto: number;
    codProducto: string;
    nombre: string;
    precioCompra: number;
    precioVenta: number;
    porcentajeGanancia: number;
    segundoPrecio: number;
    fechaVencimiento: Date;
    fechaIngreso: Date;
    fechaRegistro: Date;
    stock: number;
    imagen: string;
    descripcion: string;
    link: string;
    checked?: boolean;

    tipoProducto: TipoProducto;
    marcaProducto: MarcaProducto;
    estado: Estado;

    /**
     * Método que genera un codigo aleatorio para un producto que no tenga código de barras predefinido.
     * @returns código
     */
    generarCodigo(): string {
        var rand: number;

        rand = Math.random() * (5000 - 1) + 1; // DEVUELVE UN VALOR ALEATORIO ENTRE 1 Y 5000
        return (this.nombre ? rand + this.nombre.substring(0, 1) : rand.toString());
    }

    /**
     * Método que calcular con base a los parámetros recibidos el porcentaje de ganancia percibido
     * 
     * @param pcompra 
     * @param pventa 
     * @returns porcentaje
     */
    calcularPorcentajeGanancia(pcompra: number, pventa: number): number {
        let porcentaje = 0;

        if (!pcompra || !pventa) {
            console.log('valores incorrectos');
        } else {
            porcentaje = ((pventa - pcompra) / pcompra) * 100;
        }

        return porcentaje;
    }

    /**
     * Método que calcula conbase a los parámtros recibido el precio de venta que se desea para el producto.
     * 
     * @param pCompra 
     * @param pPorcentaje 
     * @returns 
     */
    calcularPrecioVenta(pCompra: number, pPorcentaje: number): number {

        let precioVenta = 0;

        if (!pCompra || !pPorcentaje) {
            console.log('valores incorrectos');
        } else {
            precioVenta = ((pCompra) * pPorcentaje / 100) +  pCompra;
        }

        return precioVenta;
    }

}
