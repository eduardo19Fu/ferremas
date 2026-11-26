package com.aglayatech.licorstore.service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.aglayatech.licorstore.generics.ReglaNegocioException;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JRParameter;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;

/**
 * Reportes de gestion (rotacion de productos, compras, anulaciones, cuentas por cobrar y kardex).
 * Cada metodo arma los parametros de su plantilla en {@code /reports} y la llena con la conexion del sistema;
 * el resultado es un PDF o un Excel (.xlsx).
 */
@Service
public class ReporteService {

    /** Tipos de movimiento que suman existencias; cualquier otro (venta, salida, envio, nota...) las resta. */
    private static final String TIPOS_ENTRADA = "'ENTRADA','COMPRA','ANULACION FACTURA','ANULACION NOTA'";

    private static final SimpleDateFormat VISIBLE = new SimpleDateFormat("dd/MM/yyyy");

    @Autowired
    private DataSource dataSource;

    // ------------------------------------------------------------------ rotacion de productos

    /** Ranking de productos mas vendidos en un rango (por unidades o por importe). Incluye facturas y notas de credito. */
    public byte[] masVendidos(Date fechaIni, Date fechaFin, int limite, String orden, boolean xlsx) {
        validarRango(fechaIni, fechaFin);
        Map<String, Object> params = periodo(fechaIni, fechaFin);
        params.put("LIMITE", acotar(limite, 1, 500));
        params.put("ORDEN", "IMPORTE".equalsIgnoreCase(orden) ? "IMPORTE" : "CANTIDAD");
        return generar("productos_mas_vendidos", params, xlsx, "Mas vendidos");
    }

    /** Productos con existencias que vendieron como maximo {@code umbral} unidades en el rango: dinero parado en bodega. */
    public byte[] bajaRotacion(Date fechaIni, Date fechaFin, int umbral, int limite, boolean xlsx) {
        validarRango(fechaIni, fechaFin);
        Map<String, Object> params = periodo(fechaIni, fechaFin);
        params.put("UMBRAL", acotar(umbral, 0, 100000));
        params.put("LIMITE", acotar(limite, 1, 1000));
        return generar("productos_baja_rotacion", params, xlsx, "Baja rotacion");
    }

    // ------------------------------------------------------------------ compras

    /** Compras vigentes de un rango, agrupadas por proveedor (idProveedor 0 = todos). */
    public byte[] compras(Date fechaIni, Date fechaFin, int idProveedor, boolean xlsx) {
        validarRango(fechaIni, fechaFin);
        Map<String, Object> params = periodo(fechaIni, fechaFin);
        params.put("ID_PROVEEDOR", idProveedor);
        params.put("PROVEEDOR_TXT", idProveedor == 0 ? "Todos"
                : texto("SELECT nombre FROM proveedores WHERE id_proveedor = ?", idProveedor, "Desconocido"));
        return generar("compras_periodo", params, xlsx, "Compras");
    }

    // ------------------------------------------------------------------ anulaciones

    /** Facturas, notas de credito y compras anuladas cuya fecha cae en el rango. */
    public byte[] anulaciones(Date fechaIni, Date fechaFin, boolean xlsx) {
        validarRango(fechaIni, fechaFin);
        return generar("anulaciones", periodo(fechaIni, fechaFin), xlsx, "Anulaciones");
    }

    // ------------------------------------------------------------------ cuentas por cobrar

    /** Saldos pendientes de notas de credito (ventas al credito) a la fecha de hoy; idCliente 0 = todos. */
    public byte[] cuentasPorCobrar(int idCliente, boolean soloVencidas, boolean xlsx) {
        Map<String, Object> params = new HashMap<>();
        params.put("ID_CLIENTE", idCliente);
        params.put("SOLO_VENCIDAS", soloVencidas ? 1 : 0);
        params.put("CLIENTE_TXT", idCliente == 0 ? "Todos"
                : texto("SELECT nombre FROM clientes WHERE id_cliente = ?", idCliente, "Desconocido"));
        params.put("HOY_TXT", VISIBLE.format(new Date()));
        return generar("cuentas_por_cobrar", params, xlsx, "Cuentas por cobrar");
    }

    // ------------------------------------------------------------------ kardex

    /**
     * Movimientos de un producto en un rango con saldo acumulado. El saldo inicial se reconstruye hacia atras desde la
     * existencia actual (existencia actual menos lo movido desde el inicio del rango), de modo que el saldo final del
     * kardex coincide con la existencia real aunque los movimientos antiguos no traigan su "stock inicial".
     */
    public byte[] kardex(int idProducto, Date fechaIni, Date fechaFin, boolean xlsx) {
        validarRango(fechaIni, fechaFin);
        Map<String, Object> params = periodo(fechaIni, fechaFin);
        Timestamp inicio = (Timestamp) params.get("FECHA_INICIO");

        String producto = texto("SELECT CONCAT(COALESCE(cod_producto, ''), ' - ', COALESCE(nombre, '')) FROM productos WHERE id_producto = ?",
                idProducto, null);
        if (producto == null) {
            throw new ReglaNegocioException(HttpStatus.NOT_FOUND, "El producto no se encuentra registrado.");
        }
        // existencia actual menos lo movido desde el inicio del rango (en adelante); no depende de que el rango termine hoy
        Number apertura = numero("SELECT p.stock - COALESCE(SUM(CASE WHEN UPPER(t.tipo_movimiento) IN (" + TIPOS_ENTRADA + ") "
                + "THEN m.cantidad ELSE -m.cantidad END), 0) FROM productos p "
                + "LEFT JOIN movimientos_producto m ON m.id_producto = p.id_producto AND m.fecha_movimiento >= ? "
                + "LEFT JOIN tipos_movimiento t ON t.id_tipo_movimiento = m.id_tipo_movimiento "
                + "WHERE p.id_producto = ? GROUP BY p.id_producto, p.stock", inicio, idProducto);

        params.put("ID_PRODUCTO", idProducto);
        params.put("PRODUCTO_TXT", producto);
        params.put("APERTURA", apertura == null ? 0 : apertura.intValue());
        params.put("TIPOS_ENTRADA_TXT", TIPOS_ENTRADA);
        return generar("kardex", params, xlsx, "Kardex");
    }

    // ------------------------------------------------------------------ utilidades

    private byte[] generar(String plantilla, Map<String, Object> params, boolean xlsx, String hoja) {
        params.put(JRParameter.IS_IGNORE_PAGINATION, xlsx);
        try (Connection con = dataSource.getConnection();
                InputStream fuente = getClass().getResourceAsStream("/reports/" + plantilla + ".jrxml")) {
            JasperReport reporte = JasperCompileManager.compileReport(fuente);
            JasperPrint impresion = JasperFillManager.fillReport(reporte, params, con);
            return xlsx ? exportarXlsx(impresion, hoja) : JasperExportManager.exportReportToPdf(impresion);
        } catch (Exception e) {
            throw new ReglaNegocioException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo generar el reporte: " + e.getMessage());
        }
    }

    private static byte[] exportarXlsx(JasperPrint impresion, String hoja) throws JRException {
        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        JRXlsxExporter exportador = new JRXlsxExporter();
        exportador.setExporterInput(new SimpleExporterInput(impresion));
        exportador.setExporterOutput(new SimpleOutputStreamExporterOutput(salida));
        SimpleXlsxReportConfiguration configuracion = new SimpleXlsxReportConfiguration();
        configuracion.setDetectCellType(true);
        configuracion.setRemoveEmptySpaceBetweenRows(true);
        configuracion.setWhitePageBackground(false);
        configuracion.setSheetNames(new String[] { hoja });
        exportador.setConfiguration(configuracion);
        exportador.exportReport();
        return salida.toByteArray();
    }

    /** Parametros comunes: rango inclusivo [inicio, fin] como {@code fecha >= inicio AND fecha < finExclusivo} y su texto. */
    private static Map<String, Object> periodo(Date fechaIni, Date fechaFin) {
        LocalDate ini = fechaIni.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate fin = fechaFin.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        Map<String, Object> params = new HashMap<>();
        params.put("FECHA_INICIO", Timestamp.valueOf(ini.atStartOfDay()));
        params.put("FECHA_FIN_EXCLUSIVA", Timestamp.valueOf(fin.plusDays(1).atStartOfDay()));
        params.put("RANGO", "Del " + VISIBLE.format(fechaIni) + " al " + VISIBLE.format(fechaFin));
        return params;
    }

    private static void validarRango(Date fechaIni, Date fechaFin) {
        if (fechaIni == null || fechaFin == null) {
            throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "Indique las fechas del reporte.");
        }
        if (fechaFin.before(fechaIni)) {
            throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "La fecha final no puede ser anterior a la inicial.");
        }
    }

    private static int acotar(int valor, int minimo, int maximo) {
        return Math.max(minimo, Math.min(maximo, valor));
    }

    private String texto(String sql, Object arg, String porDefecto) {
        try (Connection con = dataSource.getConnection(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setObject(1, arg);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() && rs.getString(1) != null ? rs.getString(1).trim() : porDefecto;
            }
        } catch (SQLException e) {
            throw new ReglaNegocioException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo consultar los datos del reporte: " + e.getMessage());
        }
    }

    private Number numero(String sql, Object... args) {
        try (Connection con = dataSource.getConnection(); PreparedStatement ps = con.prepareStatement(sql)) {
            for (int i = 0; i < args.length; i++) {
                ps.setObject(i + 1, args[i]);
            }
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? (Number) rs.getObject(1) : null;
            }
        } catch (SQLException e) {
            throw new ReglaNegocioException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo consultar los datos del reporte: " + e.getMessage());
        }
    }
}
