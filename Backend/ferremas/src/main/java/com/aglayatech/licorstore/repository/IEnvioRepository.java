package com.aglayatech.licorstore.repository;

import com.aglayatech.licorstore.model.Envio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IEnvioRepository extends JpaRepository<Envio, Integer> {

	// Busqueda paginada (sin distinguir mayusculas)
	org.springframework.data.domain.Page<Envio> findByReferenciaContainingIgnoreCaseOrClienteNombreContainingIgnoreCase(String nombre, String otro, org.springframework.data.domain.Pageable pageable);
}
