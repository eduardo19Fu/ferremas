package com.aglayatech.licorstore.repository;

import java.util.Date;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.aglayatech.licorstore.model.Cotizacion;
import com.aglayatech.licorstore.model.dto.DetalleProformaItem;
import com.aglayatech.licorstore.model.dto.ProformaResumen;

public interface ICotizacionRepository extends JpaRepository<Cotizacion, Long> {

	/**
	 * Listado paginado de proformas con filtros opcionales (rango de fechas, usuario y busqueda).
	 * {@code idUsuario = 0} significa "todos". La factura vigente que convirtio la proforma (si existe) se une
	 * por {@code facturas.id_proforma_origen}, ignorando las anuladas.
	 */
	@Query(value = "select new com.aglayatech.licorstore.model.dto.ProformaResumen("
			+ "p.idProforma, p.noProforma, p.fechaEmision, c.nombre, c.nit, u.usuario, p.total, e.estado, f.noFactura) "
			+ "from Cotizacion p left join p.cliente c left join p.usuario u left join p.estado e "
			+ "left join Factura f on f.idProformaOrigen = p.idProforma and f.estado.estado <> 'ANULADO' "
			+ "where p.fechaEmision >= :fechaIni and p.fechaEmision < :fechaFin "
			+ "and (:idUsuario = 0 or u.idUsuario = :idUsuario) "
			+ "and (:termino = '' or lower(c.nombre) like lower(concat('%', :termino, '%')) or lower(c.nit) like lower(concat('%', :termino, '%')) "
			+ "or str(p.noProforma) like concat('%', :termino, '%'))",
			countQuery = "select count(p) from Cotizacion p left join p.cliente c left join p.usuario u "
			+ "where p.fechaEmision >= :fechaIni and p.fechaEmision < :fechaFin "
			+ "and (:idUsuario = 0 or u.idUsuario = :idUsuario) "
			+ "and (:termino = '' or lower(c.nombre) like lower(concat('%', :termino, '%')) or lower(c.nit) like lower(concat('%', :termino, '%')) "
			+ "or str(p.noProforma) like concat('%', :termino, '%'))")
	Page<ProformaResumen> buscarResumen(@Param("termino") String termino, @Param("fechaIni") Date fechaIni,
			@Param("fechaFin") Date fechaFin, @Param("idUsuario") int idUsuario, Pageable pageable);

	/**
	 * Detalle de una proforma, paginado. La relacion proforma -> detalle es unidireccional, por eso se filtra con
	 * una subconsulta; la proyeccion trae solo las columnas necesarias (sin cargar el producto completo).
	 */
	@Query(value = "select new com.aglayatech.licorstore.model.dto.DetalleProformaItem("
			+ "d.idDetalle, p.codProducto, p.nombre, d.cantidad, d.precioUnitario, d.descuento, d.subTotal, d.subTotalDescuento) "
			+ "from DetalleCotizacion d left join d.producto p "
			+ "where d.idDetalle in (select i.idDetalle from Cotizacion c join c.itemsProforma i where c.idProforma = :idProforma)",
			countQuery = "select count(d) from DetalleCotizacion d "
			+ "where d.idDetalle in (select i.idDetalle from Cotizacion c join c.itemsProforma i where c.idProforma = :idProforma)")
	Page<DetalleProformaItem> findDetalle(@Param("idProforma") Long idProforma, Pageable pageable);
}
