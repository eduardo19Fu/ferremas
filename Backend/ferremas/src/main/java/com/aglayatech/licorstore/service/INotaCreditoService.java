package com.aglayatech.licorstore.service;

import com.aglayatech.licorstore.model.Estado;
import com.aglayatech.licorstore.model.NotaCredito;

import java.util.List;

public interface INotaCreditoService {

    public List<NotaCredito> findNotas();

    public List<NotaCredito> findNotasActivas(Estado estado);

    public NotaCredito findNota(Integer idNota);

    public NotaCredito save(NotaCredito notaCredito);

    public void delete(Integer idNota);

	public org.springframework.data.domain.Page<NotaCredito> search(String termino, org.springframework.data.domain.Pageable pageable);

	/** Detalle (productos) de una nota de credito, paginado. */
	public org.springframework.data.domain.Page<com.aglayatech.licorstore.model.dto.DetalleNotaCreditoItem> findDetalle(Integer idNota, org.springframework.data.domain.Pageable pageable);

    public org.springframework.data.domain.Page<NotaCredito> searchByEstado(String termino, Estado estado, org.springframework.data.domain.Pageable pageable);
}
