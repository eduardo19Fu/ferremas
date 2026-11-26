import { UsuarioAuxiliar } from './auxiliar/usuario-auxiliar';
import { Cliente } from './cliente';
import { Estado } from './estado';
import { DetalleProforma } from './detalle-proforma';

export class Proforma {

    idProforma: number;
    noProforma: number;
    total = 0;
    fechaEmision: Date;

    estado: Estado;
    usuario: UsuarioAuxiliar;
    cliente: Cliente;
    itemsProforma: DetalleProforma[] = [];

    calcularTotal(): number {
        this.total = this.itemsProforma.reduce((suma, item) => suma + item.calcularImporteDescuento(), 0);
        this.total = Math.round((this.total + Number.EPSILON) * 100) / 100;
        return this.total;
    }

    /** Crea una proforma (con sus lineas) a partir del JSON que sirve el backend. */
    public static desde(json: any): Proforma {
        const proforma = new Proforma();
        Object.assign(proforma, json);
        proforma.itemsProforma = (json.itemsProforma || []).map((linea: any) => DetalleProforma.desde(linea));
        return proforma;
    }
}
