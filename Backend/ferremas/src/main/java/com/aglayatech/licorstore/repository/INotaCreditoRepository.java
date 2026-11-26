package com.aglayatech.licorstore.repository;

import com.aglayatech.licorstore.model.Estado;
import com.aglayatech.licorstore.model.NotaCredito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface INotaCreditoRepository extends JpaRepository<NotaCredito, Integer> {

    public List<NotaCredito> findNotasByEstado(Estado estado);

	/**
	 * Detalle de una nota de credito, paginado. La relacion nota -> detalle es unidireccional, por eso se filtra con
	 * una subconsulta; la proyeccion trae solo las columnas necesarias (sin cargar el producto completo).
	 */
	@org.springframework.data.jpa.repository.Query(value = "select new com.aglayatech.licorstore.model.dto.DetalleNotaCreditoItem("
			+ "d.idNotaDetalle, p.codProducto, p.nombre, d.cantidad, d.descuento, d.subTotal, d.subTotalDescuento) "
			+ "from DetalleNotaCredito d left join d.producto p "
			+ "where d.idNotaDetalle in (select i.idNotaDetalle from NotaCredito n join n.items i where n.idNotaCredito = :idNota)",
			countQuery = "select count(d) from DetalleNotaCredito d "
			+ "where d.idNotaDetalle in (select i.idNotaDetalle from NotaCredito n join n.items i where n.idNotaCredito = :idNota)")
	org.springframework.data.domain.Page<com.aglayatech.licorstore.model.dto.DetalleNotaCreditoItem> findDetalle(
			@org.springframework.data.repository.query.Param("idNota") Integer idNota, org.springframework.data.domain.Pageable pageable);

	// Busqueda paginada (sin distinguir mayusculas)
	org.springframework.data.domain.Page<NotaCredito> findByClienteNombreContainingIgnoreCase(String nombre, org.springframework.data.domain.Pageable pageable);

	@org.springframework.data.jpa.repository.Query("select n from NotaCredito n where n.estado = :estado and lower(n.cliente.nombre) like lower(concat('%', :termino, '%'))")
	org.springframework.data.domain.Page<NotaCredito> searchByEstado(@org.springframework.data.repository.query.Param("termino") String termino,
			@org.springframework.data.repository.query.Param("estado") Estado estado, org.springframework.data.domain.Pageable pageable);
}
