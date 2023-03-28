import { NotaCredito } from './nota-credito';
import { Estado } from './estado';

export class PagoParcial {
    idPagoParcial: number;
    pago: number;
    fechaPago: Date;
    fechaProximoPago: Date;

    notaCredito: NotaCredito;
    estado: Estado;
}
