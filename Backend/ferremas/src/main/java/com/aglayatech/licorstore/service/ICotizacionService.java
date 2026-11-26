package com.aglayatech.licorstore.service;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.aglayatech.licorstore.model.Cotizacion;
import com.aglayatech.licorstore.model.Usuario;
import com.aglayatech.licorstore.model.dto.DetalleProformaItem;
import com.aglayatech.licorstore.model.dto.ProformaResumen;

public interface ICotizacionService {

    public List<Cotizacion> findAll();

    public Cotizacion findProforma(Long idproforma);

    /** Listado paginado con filtros opcionales; {@code fechaFin} es inclusiva y {@code idUsuario} 0 = todos. */
    public Page<ProformaResumen> buscar(String termino, Date fechaIni, Date fechaFin, int idUsuario, Pageable pageable);

    /** Detalle (productos) de una proforma, paginado. */
    public Page<DetalleProformaItem> findDetalle(Long idProforma, Pageable pageable);

    /** Verdadero si la proforma ya fue convertida en una factura vigente. */
    public boolean estaFacturada(Long idProforma);

    /**
     * Registra una proforma. Los precios y totales se recalculan en el servidor a partir del catalogo; no se
     * descuenta inventario.
     *
     * @throws com.aglayatech.licorstore.generics.ReglaNegocioException si los datos no son validos
     */
    public Cotizacion registrar(Cotizacion datos, Usuario usuario);

    /** Reemplaza el cliente y las lineas de una proforma (solo si aun no se ha facturado). */
    public Cotizacion actualizar(Long idProforma, Cotizacion datos);

    /** Elimina una proforma (solo si aun no se ha facturado). */
    public void eliminar(Long idProforma);

    /** PDF de la proforma. */
    public byte[] generarPdf(Long idProforma);

    /**
     * Reporte de conversion de proformas a facturas, por usuario, en un rango de fechas.
     *
     * @param idUsuario 0 para todos los usuarios
     * @param formato   "PDF" o "XLSX"
     */
    public byte[] reporteConversion(Date fechaIni, Date fechaFin, int idUsuario, String formato);
}
