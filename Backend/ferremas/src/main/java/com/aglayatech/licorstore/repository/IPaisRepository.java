package com.aglayatech.licorstore.repository;

import com.aglayatech.licorstore.model.Pais;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IPaisRepository extends JpaRepository<Pais, Integer> {

	// Busqueda paginada (sin distinguir mayusculas)
	org.springframework.data.domain.Page<Pais> findByNombreContainingIgnoreCase(String nombre, org.springframework.data.domain.Pageable pageable);
}
