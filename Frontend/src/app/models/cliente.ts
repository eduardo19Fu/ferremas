import { Factura } from './factura';

export class Cliente {

    idCliente: number;
    nombre: string;
    nit: string;
    identificacion: string;
    direccion: string;
    fechaRegistro: Date;
    telefono: string;

    facturas: Factura[] = [];
}
