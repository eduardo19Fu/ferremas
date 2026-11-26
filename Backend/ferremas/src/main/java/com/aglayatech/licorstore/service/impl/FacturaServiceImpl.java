package com.aglayatech.licorstore.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import com.aglayatech.licorstore.model.TipoFactura;
import com.aglayatech.licorstore.repository.ITipoFacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import com.aglayatech.licorstore.model.Factura;
import com.aglayatech.licorstore.repository.IFacturaRepository;
import com.aglayatech.licorstore.service.IFacturaService;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;

@Service
public class FacturaServiceImpl implements IFacturaService {

	@Autowired
	private IFacturaRepository repoFactura;

	@Autowired
	private ITipoFacturaRepository tipoFacturaRepository;

	@Autowired
	protected DataSource localDataSource;

	@Override
	public List<Factura> findAll() {
		return repoFactura.findAll(Sort.by(Direction.DESC, "fecha"));
	}

	@Override
	public Page<Factura> findAll(Pageable pageable) {
		return repoFactura.findAll(pageable);
	}

	@Override
	public Factura findFactura(Long idfactura) {
		return repoFactura.findById(idfactura).orElse(null);
	}

	@Override
	public List<Factura> findFacturasPorFechas(Date fechaIni, Date fechaFin) {
		return repoFactura.queryFacturasPorFecha(fechaIni, fechaFin);
	}

	@Override
	public Factura save(Factura factura) {
		return repoFactura.save(factura);
	}

	@Override
	public TipoFactura findTipoFactura(Integer idTipoFactura) {
		return this.tipoFacturaRepository.findById(idTipoFactura).orElse(null);
	}

	@Override
	public Integer getMaxVentas() {
		return this.repoFactura.getMaxVentas();
	}

	@Override
	public int deleteByRangoFechas(Date fecha1, Date fecha2) {
		return repoFactura.deleteByFechaBetween(fecha1, fecha2);
	}

	/****************** PDF REPORT SERVICES *******************/

	// REPORTE DE VENTAS DIARIAS
	@Override
	public byte[] resportDailySales(Integer usuario, Date fecha)
			throws JRException, FileNotFoundException, SQLException {

		Connection con = localDataSource.getConnection(); // Obtiene la conexión actual a la base de datos
		Map<String, Object> params = new HashMap<>();
		InputStream file = getClass().getResourceAsStream("/reports/poliza.jrxml");
		params.put("usuario", usuario);
		params.put("fechaIni", fecha);

		JasperReport jasperReport = JasperCompileManager.compileReport(file);
		JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, con);

		ByteArrayOutputStream byteArrayOutputStream = getByteArrayOutputStream(jasperPrint);

		con.close();
		return byteArrayOutputStream.toByteArray();
	}

	// GENERADOR DE REPORTE DE FACTURA
	@Override
	public byte[] showBill(Long idfactura)
			throws JRException, FileNotFoundException, SQLException {

		Connection con = localDataSource.getConnection();
		Map<String, Object> params = new HashMap<>();
		params.put("idfactura", idfactura);
		InputStream file = getClass().getResourceAsStream("/reports/factura.jrxml");

		JasperReport jasperReport = JasperCompileManager.compileReport(file);
		JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, con);

		ByteArrayOutputStream byteArrayOutputStream = getByteArrayOutputStream(jasperPrint);

		con.close();
		return byteArrayOutputStream.toByteArray();
	}

	@Override
	public byte[] showBill2(Long idfactura)
			throws JRException, FileNotFoundException, SQLException {

		Connection con = localDataSource.getConnection();
		Map<String, Object> params = new HashMap<>();
		params.put("idfactura", idfactura);
		InputStream file = getClass().getResourceAsStream("/reports/factura_2.jrxml");

		JasperReport jasperReport = JasperCompileManager.compileReport(file);
		JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, con);

		ByteArrayOutputStream byteArrayOutputStream = getByteArrayOutputStream(jasperPrint);

		con.close();
		return byteArrayOutputStream.toByteArray();
	}

	@Override
	public byte[] reporteVentasDiarias(Date fecha, int idUsuario, String formato) {
		boolean xlsx = "XLSX".equalsIgnoreCase(formato);

		java.util.Calendar c = java.util.Calendar.getInstance();
		c.setTime(fecha);
		c.set(java.util.Calendar.HOUR_OF_DAY, 0);
		c.set(java.util.Calendar.MINUTE, 0);
		c.set(java.util.Calendar.SECOND, 0);
		c.set(java.util.Calendar.MILLISECOND, 0);
		java.sql.Timestamp inicio = new java.sql.Timestamp(c.getTimeInMillis());
		c.add(java.util.Calendar.DAY_OF_MONTH, 1);
		java.sql.Timestamp finExclusivo = new java.sql.Timestamp(c.getTimeInMillis());

		try (Connection con = localDataSource.getConnection();
				InputStream plantilla = getClass().getResourceAsStream("/reports/ventas_diarias.jrxml")) {
			Map<String, Object> params = new HashMap<>();
			params.put(net.sf.jasperreports.engine.JRParameter.IS_IGNORE_PAGINATION, xlsx);
			params.put("ID_USUARIO", idUsuario);
			params.put("FECHA_INICIO", inicio);
			params.put("FECHA_FIN_EXCLUSIVA", finExclusivo);
			params.put("FECHA_TXT", new java.text.SimpleDateFormat("dd/MM/yyyy").format(inicio));
			params.put("VENDEDOR_TXT", nombreVendedor(con, idUsuario));

			JasperReport reporte = JasperCompileManager.compileReport(plantilla);
			JasperPrint impresion = JasperFillManager.fillReport(reporte, params, con);
			return xlsx ? exportarXlsx(impresion, "Ventas diarias") : JasperExportManager.exportReportToPdf(impresion);
		} catch (Exception e) {
			throw new com.aglayatech.licorstore.generics.ReglaNegocioException(
					org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
					"No se pudo generar el reporte de ventas diarias: " + e.getMessage());
		}
	}

	@Override
	public byte[] reporteVentasMensuales(int anio, int idUsuario, String formato) {
		if (anio < 2000 || anio > 2100) {
			throw new com.aglayatech.licorstore.generics.ReglaNegocioException(
					org.springframework.http.HttpStatus.BAD_REQUEST, "El año debe estar entre 2000 y 2100.");
		}
		boolean xlsx = "XLSX".equalsIgnoreCase(formato);

		java.sql.Timestamp inicio = java.sql.Timestamp.valueOf(java.time.LocalDate.of(anio, 1, 1).atStartOfDay());
		java.sql.Timestamp finExclusivo = java.sql.Timestamp.valueOf(java.time.LocalDate.of(anio + 1, 1, 1).atStartOfDay());

		try (Connection con = localDataSource.getConnection();
				InputStream plantilla = getClass().getResourceAsStream("/reports/ventas_mensuales.jrxml")) {
			Map<String, Object> params = new HashMap<>();
			params.put(net.sf.jasperreports.engine.JRParameter.IS_IGNORE_PAGINATION, xlsx);
			params.put("ID_USUARIO", idUsuario);
			params.put("FECHA_INICIO", inicio);
			params.put("FECHA_FIN_EXCLUSIVA", finExclusivo);
			params.put("ANIO", anio);
			params.put("VENDEDOR_TXT", nombreVendedor(con, idUsuario));

			JasperReport reporte = JasperCompileManager.compileReport(plantilla);
			JasperPrint impresion = JasperFillManager.fillReport(reporte, params, con);
			return xlsx ? exportarXlsx(impresion, "Ventas " + anio) : JasperExportManager.exportReportToPdf(impresion);
		} catch (Exception e) {
			throw new com.aglayatech.licorstore.generics.ReglaNegocioException(
					org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
					"No se pudo generar el reporte de ventas mensuales: " + e.getMessage());
		}
	}

	private byte[] exportarXlsx(JasperPrint impresion, String hoja) throws JRException {
		ByteArrayOutputStream salida = new ByteArrayOutputStream();
		net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter exportador = new net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter();
		exportador.setExporterInput(new net.sf.jasperreports.export.SimpleExporterInput(impresion));
		exportador.setExporterOutput(new net.sf.jasperreports.export.SimpleOutputStreamExporterOutput(salida));
		net.sf.jasperreports.export.SimpleXlsxReportConfiguration configuracion = new net.sf.jasperreports.export.SimpleXlsxReportConfiguration();
		configuracion.setDetectCellType(true);
		configuracion.setRemoveEmptySpaceBetweenRows(true);
		configuracion.setWhitePageBackground(false);
		configuracion.setSheetNames(new String[] { hoja });
		exportador.setConfiguration(configuracion);
		exportador.exportReport();
		return salida.toByteArray();
	}

	private String nombreVendedor(Connection con, int idUsuario) throws SQLException {
		if (idUsuario == 0) {
			return "Todos";
		}
		try (java.sql.PreparedStatement ps = con.prepareStatement(
				"SELECT TRIM(CONCAT(COALESCE(primer_nombre, ''), ' ', COALESCE(apellido, ''))) FROM usuarios WHERE id_usuario = ?")) {
			ps.setInt(1, idUsuario);
			try (java.sql.ResultSet rs = ps.executeQuery()) {
				return rs.next() ? rs.getString(1) : "Desconocido";
			}
		}
	}

	protected ByteArrayOutputStream getByteArrayOutputStream(JasperPrint jasperPrint) throws JRException {
	    ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
	    JasperExportManager.exportReportToPdfStream(jasperPrint, byteArrayOutputStream);
	    return byteArrayOutputStream;
	}

	@Override
	public org.springframework.data.domain.Page<Factura> search(String termino, org.springframework.data.domain.Pageable pageable) {
		// Con termino vacio la consulta devuelve todas las facturas (LEFT JOIN) y permite ordenar por cliente
		String t = termino == null ? "" : termino.trim();
		return repoFactura.searchFacturas(t, pageable);
	}

	@Override
	public org.springframework.data.domain.Page<com.aglayatech.licorstore.model.dto.DetalleFacturaItem> findDetalle(Long idFactura, Pageable pageable) {
		return repoFactura.findDetalle(idFactura, pageable);
	}

	@Override
	public org.springframework.data.domain.Page<Factura> searchPorFechas(String termino, java.util.Date fechaIni, java.util.Date fechaFin, org.springframework.data.domain.Pageable pageable) {
		String t = termino == null ? "" : termino.trim();
		return repoFactura.searchPorFechas(t, fechaIni, fechaFin, pageable);
	}
}
