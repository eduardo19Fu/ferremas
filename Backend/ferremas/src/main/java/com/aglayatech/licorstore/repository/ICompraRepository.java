package com.aglayatech.licorstore.repository;

import com.aglayatech.licorstore.model.Compra;
import com.aglayatech.licorstore.model.TipoComprobante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ICompraRepository extends JpaRepository<Compra, Integer> {

    @Query("Select t from TipoComprobante t")
    List<TipoComprobante> findtipos();

	// Busqueda paginada (sin distinguir mayusculas)
	org.springframework.data.domain.Page<Compra> findByNoComprobanteContainingIgnoreCaseOrProveedorNombreContainingIgnoreCase(String nombre, String otro, org.springframework.data.domain.Pageable pageable);
}
