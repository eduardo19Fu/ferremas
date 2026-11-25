package com.aglayatech.licorstore.service;

import com.aglayatech.licorstore.model.Compra;
import com.aglayatech.licorstore.model.TipoComprobante;

import java.util.List;

public interface ICompraService {

    public List<Compra> getAll();

    public Compra getCompra(Integer idcompra);

    public Compra save(Compra compra);

    public void delete(Integer idcompra);

    /****** Buscar Tipos de Comprobante ******/
    public List<TipoComprobante> getTipos();

	public org.springframework.data.domain.Page<Compra> search(String termino, org.springframework.data.domain.Pageable pageable);

	/** Detalle (productos) de una compra, paginado. */
	public org.springframework.data.domain.Page<com.aglayatech.licorstore.model.dto.DetalleCompraItem> findDetalle(Integer idCompra, org.springframework.data.domain.Pageable pageable);
}
