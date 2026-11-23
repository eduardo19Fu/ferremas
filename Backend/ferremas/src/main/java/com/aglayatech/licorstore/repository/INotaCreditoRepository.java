package com.aglayatech.licorstore.repository;

import com.aglayatech.licorstore.model.Estado;
import com.aglayatech.licorstore.model.NotaCredito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface INotaCreditoRepository extends JpaRepository<NotaCredito, Integer> {

    public List<NotaCredito> findNotasByEstado(Estado estado);

	// Busqueda paginada (sin distinguir mayusculas)
	org.springframework.data.domain.Page<NotaCredito> findByClienteNombreContainingIgnoreCase(String nombre, org.springframework.data.domain.Pageable pageable);

	@org.springframework.data.jpa.repository.Query("select n from NotaCredito n where n.estado = :estado and lower(n.cliente.nombre) like lower(concat('%', :termino, '%'))")
	org.springframework.data.domain.Page<NotaCredito> searchByEstado(@org.springframework.data.repository.query.Param("termino") String termino,
			@org.springframework.data.repository.query.Param("estado") Estado estado, org.springframework.data.domain.Pageable pageable);
}
