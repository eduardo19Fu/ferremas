package com.aglayatech.licorstore.service;

import java.io.FileNotFoundException;
import java.sql.SQLException;
import java.util.Date;
import java.util.List;

import com.aglayatech.licorstore.model.TipoFactura;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.aglayatech.licorstore.model.Factura;

import net.sf.jasperreports.engine.JRException;

public interface IFacturaService {
	
	public List<Factura> findAll();
	
	public Page<Factura> findAll(Pageable pageable);

	/** Detalle (productos) de una factura, paginado. */
	public Page<com.aglayatech.licorstore.model.dto.DetalleFacturaItem> findDetalle(Long idFactura, Pageable pageable);
	
	public Factura findFactura(Long idfactura);

	public List<Factura> findFacturasPorFechas(Date fechaIni, Date fechaFin);
	
	public Factura save(Factura factura);

	public TipoFactura findTipoFactura(Integer idTipoFactura);

	public Integer getMaxVentas();

	public int deleteByRangoFechas(Date fecha1, Date fecha2);
	
	/********* PDF REPORTS SERVICES ***********/
	
	public byte[] resportDailySales(Integer usuario, Date fecha) throws JRException, FileNotFoundException, SQLException;
	
	/** Facturas vigentes de un dia (idUsuario 0 = todos los vendedores) en PDF o XLSX. */
	public byte[] reporteVentasDiarias(Date fecha, int idUsuario, String formato);

	/** Ventas por mes de un anio (idUsuario 0 = todos los vendedores) en PDF o XLSX. */
	public byte[] reporteVentasMensuales(int anio, int idUsuario, String formato);

	public byte[] showBill(Long idfactura) throws JRException, FileNotFoundException, SQLException;

	public byte[] showBill2(Long idfactura) throws JRException, FileNotFoundException, SQLException;

	public org.springframework.data.domain.Page<Factura> search(String termino, org.springframework.data.domain.Pageable pageable);

	public org.springframework.data.domain.Page<Factura> searchPorFechas(String termino, java.util.Date fechaIni, java.util.Date fechaFin, org.springframework.data.domain.Pageable pageable);
}
