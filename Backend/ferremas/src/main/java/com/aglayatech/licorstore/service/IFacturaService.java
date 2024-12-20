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
	
	public Factura findFactura(Long idfactura);

	public List<Factura> findFacturasPorFechas(Date fechaIni, Date fechaFin);
	
	public Factura save(Factura factura);

	public TipoFactura findTipoFactura(Integer idTipoFactura);

	public Integer getMaxVentas();

	public int deleteByRangoFechas(Date fecha1, Date fecha2);
	
	/********* PDF REPORTS SERVICES ***********/
	
	public byte[] resportDailySales(Integer usuario, Date fecha) throws JRException, FileNotFoundException, SQLException;
	
	public byte[] showBill(Long idfactura) throws JRException, FileNotFoundException, SQLException;

	public byte[] showBill2(Long idfactura) throws JRException, FileNotFoundException, SQLException;

}
