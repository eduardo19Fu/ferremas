import { Usuario } from './usuario';
import { Estado } from './estado';
import { DetalleNotaCredito } from './detalle-nota-credito';
import { Cliente } from './cliente';
import { UsuarioAuxiliar } from './auxiliar/usuario-auxiliar';

export class NotaCredito {
    idNotaCredito: number;
    abono: number;
    total: number;
    restante: number;
    fechaCreacion: Date;
    fechaPagoLimite: Date;

    usuario: UsuarioAuxiliar;
    estado: Estado;
    cliente: Cliente;
    items: DetalleNotaCredito[] = [];

    calcularTotal(): number {
        let total = 0;
        this.items.forEach((item: DetalleNotaCredito) => {
            total += item.calcularImporteDescuento();
        });

        return total;
    }

    calcularSaldoRestante(abono: number, totalEnvio: number): number {
        let saldoRestante = 0;
        saldoRestante = totalEnvio - abono;
        return saldoRestante;
    }
}
