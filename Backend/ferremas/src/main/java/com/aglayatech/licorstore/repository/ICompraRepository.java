package com.aglayatech.licorstore.repository;

import com.aglayatech.licorstore.model.Compra;
import com.aglayatech.licorstore.model.TipoComprobante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ICompraRepository extends JpaRepository<Compra, Integer> {

    @Query("Select t from TipoComprobante t")
    List<TipoComprobante> findtipos();

	/**
	 * Detalle de una compra, paginado. La relacion compra -> detalle es unidireccional, por eso se filtra con
	 * una subconsulta; la proyeccion trae solo las columnas necesarias (sin cargar el producto completo).
	 */
	@Query(value = "select new com.aglayatech.licorstore.model.dto.DetalleCompraItem("
			+ "d.idDetalleCompra, p.codProducto, p.nombre, d.cantidad, d.precioUnitario, d.subTotal) "
			+ "from DetalleCompra d left join d.producto p "
			+ "where d.idDetalleCompra in (select i.idDetalleCompra from Compra c join c.items i where c.idCompra = :idCompra)",
			countQuery = "select count(d) from DetalleCompra d "
			+ "where d.idDetalleCompra in (select i.idDetalleCompra from Compra c join c.items i where c.idCompra = :idCompra)")
	org.springframework.data.domain.Page<com.aglayatech.licorstore.model.dto.DetalleCompraItem> findDetalle(
			@org.springframework.data.repository.query.Param("idCompra") Integer idCompra, org.springframework.data.domain.Pageable pageable);

	// Busqueda paginada (sin distinguir mayusculas)
	org.springframework.data.domain.Page<Compra> findByNoComprobanteContainingIgnoreCaseOrProveedorNombreContainingIgnoreCase(String nombre, String otro, org.springframework.data.domain.Pageable pageable);
}
