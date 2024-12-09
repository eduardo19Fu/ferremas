package com.aglayatech.licorstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aglayatech.licorstore.model.Factura;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

public interface IFacturaRepository extends JpaRepository<Factura, Long> {

    @Query(value = "Select get_cant_ventas()", nativeQuery = true)
    Integer getMaxVentas();

    @Transactional
    @Modifying
    @Query(value = "Delete from facturas f where f.fecha between :fechaIni and :fechaFin", nativeQuery = true)
    int deleteByFechaBetween(@Param("fechaIni") Date fechaIni, @Param("fechaFin") Date fechaFin);

    @Query(value = "{call PR_VENTAS_POR_FECHA(:date1, :date2)}", nativeQuery = true)
    List<Factura> queryFacturasPorFecha(@Param("date1") Date date1, @Param("date2") Date date2);
}
