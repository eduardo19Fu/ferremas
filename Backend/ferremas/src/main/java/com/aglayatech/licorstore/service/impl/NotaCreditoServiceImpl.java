package com.aglayatech.licorstore.service.impl;

import com.aglayatech.licorstore.model.Estado;
import com.aglayatech.licorstore.model.NotaCredito;
import com.aglayatech.licorstore.repository.INotaCreditoRepository;
import com.aglayatech.licorstore.service.INotaCreditoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotaCreditoServiceImpl implements INotaCreditoService {

    @Autowired
    private INotaCreditoRepository notaCreditoRepository;

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
