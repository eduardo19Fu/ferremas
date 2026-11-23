package com.aglayatech.licorstore.repository;

import com.aglayatech.licorstore.model.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ICotizacionRepository extends JpaRepository<Cotizacion, Long> {

	// Busqueda paginada (sin distinguir mayusculas)
	org.springframework.data.domain.Page<Cotizacion> findByClienteNombreContainingIgnoreCase(String nombre, org.springframework.data.domain.Pageable pageable);
}
