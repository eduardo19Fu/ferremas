package com.aglayatech.licorstore.repository;

import com.aglayatech.licorstore.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IProveedorRepository extends JpaRepository<Proveedor, Integer> {

	// Busqueda paginada (sin distinguir mayusculas)
	org.springframework.data.domain.Page<Proveedor> findByNombreContainingIgnoreCaseOrContactoContainingIgnoreCase(String nombre, String otro, org.springframework.data.domain.Pageable pageable);
}
