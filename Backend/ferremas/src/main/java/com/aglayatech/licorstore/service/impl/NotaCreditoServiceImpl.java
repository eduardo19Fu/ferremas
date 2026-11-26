package com.aglayatech.licorstore.service.impl;

import com.aglayatech.licorstore.model.Estado;
import com.aglayatech.licorstore.model.NotaCredito;
import com.aglayatech.licorstore.repository.INotaCreditoRepository;
import com.aglayatech.licorstore.service.INotaCreditoService;
import com.aglayatech.licorstore.generics.ReglaNegocioException;
import com.aglayatech.licorstore.model.DetalleNotaCredito;
import com.aglayatech.licorstore.model.MovimientoProducto;
import com.aglayatech.licorstore.model.Producto;
import com.aglayatech.licorstore.model.Usuario;
import com.aglayatech.licorstore.service.IEstadoService;
import com.aglayatech.licorstore.service.IMovimientoProductoService;
import com.aglayatech.licorstore.service.IProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotaCreditoServiceImpl implements INotaCreditoService {

    @Autowired
    private INotaCreditoRepository notaCreditoRepository;

    @Autowired
    private IEstadoService estadoService;

    @Autowired
    private IProductoService productoService;

    @Autowired
    private IMovimientoProductoService movimientoService;

    @Override
    public List<NotaCredito> findNotas() {
        return notaCreditoRepository.findAll();
    }

    @Override
    public List<NotaCredito> findNotasActivas(Estado estado) {
        return notaCreditoRepository.findNotasByEstado(estado);
    }

    @Override
    public NotaCredito findNota(Integer idNota) {
        return notaCreditoRepository.findById(idNota).orElse(null);
    }

    @Override
    public NotaCredito save(NotaCredito notaCredito) {
        return notaCreditoRepository.save(notaCredito);
    }

    @Override
    @Transactional
    public NotaCredito anular(Integer idNota, Usuario usuario) {
        NotaCredito nota = notaCreditoRepository.findById(idNota)
                .orElseThrow(() -> new ReglaNegocioException(HttpStatus.NOT_FOUND, "La nota de crédito no se encuentra registrada."));

        Estado anulado = estadoService.findByEstado("ANULADO");
        if (anulado == null) {
            throw new ReglaNegocioException(HttpStatus.INTERNAL_SERVER_ERROR, "El estado ANULADO no está configurado en el sistema.");
        }
        if (nota.getEstado() != null && nota.getEstado().getIdEstado().equals(anulado.getIdEstado())) {
            throw new ReglaNegocioException(HttpStatus.CONFLICT, "La nota de crédito ya está anulada.");
        }
        if (nota.getEstado() == null || nota.getEstado().getIdEstado() != 1) {
            throw new ReglaNegocioException(HttpStatus.CONFLICT, "Solo se pueden anular notas de crédito activas.");
        }
        if (nota.getAbono() != null && nota.getAbono() > 0) {
            throw new ReglaNegocioException(HttpStatus.CONFLICT,
                    "La nota tiene abonos registrados (Q" + String.format("%.2f", nota.getAbono()) + ") y no puede anularse.");
        }

        // las existencias vuelven al inventario (la creacion de la nota las habia descontado)
        for (DetalleNotaCredito item : nota.getItems()) {
            Producto producto = item.getProducto();
            if (producto == null) {
                continue;                                   // linea sin producto asociado: no hay inventario que restituir
            }
            producto.setStock(producto.getStock() + item.getCantidad());
            productoService.save(producto);

            MovimientoProducto movimiento = new MovimientoProducto();
            movimiento.setTipoMovimiento(movimientoService.findTipoMovimiento("ANULACION NOTA"));
            movimiento.setUsuario(usuario);
            movimiento.setProducto(producto);
            movimiento.setStockInicial(producto.getStock());
            movimiento.setCantidad(item.getCantidad());
            movimientoService.save(movimiento);
        }

        nota.setEstado(anulado);
        return notaCreditoRepository.save(nota);
    }

    @Override
    public void delete(Integer idNota) {
        notaCreditoRepository.deleteById(idNota);
    }

	@Override
	public org.springframework.data.domain.Page<com.aglayatech.licorstore.model.dto.DetalleNotaCreditoItem> findDetalle(Integer idNota, org.springframework.data.domain.Pageable pageable) {
		return notaCreditoRepository.findDetalle(idNota, pageable);
	}

	@Override
	public org.springframework.data.domain.Page<NotaCredito> search(String termino, org.springframework.data.domain.Pageable pageable) {
		if (termino == null || termino.trim().isEmpty()) {
			return notaCreditoRepository.findAll(pageable);
		}
		String t = termino.trim();
		return notaCreditoRepository.findByClienteNombreContainingIgnoreCase(t, pageable);
	}

	@Override
	public org.springframework.data.domain.Page<NotaCredito> searchByEstado(String termino, Estado estado, org.springframework.data.domain.Pageable pageable) {
		return notaCreditoRepository.searchByEstado(termino == null ? "" : termino.trim(), estado, pageable);
	}
}
