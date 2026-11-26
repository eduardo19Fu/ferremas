package com.aglayatech.licorstore.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aglayatech.licorstore.generics.ReglaNegocioException;
import com.aglayatech.licorstore.model.Cliente;
import com.aglayatech.licorstore.model.Cotizacion;
import com.aglayatech.licorstore.model.DetalleCotizacion;
import com.aglayatech.licorstore.model.Estado;
import com.aglayatech.licorstore.model.Producto;
import com.aglayatech.licorstore.model.Usuario;
import com.aglayatech.licorstore.model.dto.DetalleProformaItem;
import com.aglayatech.licorstore.model.dto.ProformaResumen;
import com.aglayatech.licorstore.repository.ICotizacionRepository;
import com.aglayatech.licorstore.repository.IFacturaRepository;
import com.aglayatech.licorstore.service.IClienteService;
import com.aglayatech.licorstore.service.ICotizacionService;
import com.aglayatech.licorstore.service.IEstadoService;
import com.aglayatech.licorstore.service.IProductoService;

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

@Service
public class CotizacionServiceImpl implements ICotizacionService {

    private static final Date INICIO_DE_LOS_TIEMPOS = new Date(0L);

    @Autowired
    private ICotizacionRepository proformaRepository;

    @Autowired
    private IFacturaRepository facturaRepository;

    @Autowired
    private IProductoService productoService;

    @Autowired
    private IClienteService clienteService;

    @Autowired
    private IEstadoService estadoService;

    @Autowired
    protected DataSource dataSource;

    @Override
    public List<Cotizacion> findAll() {
        return this.proformaRepository.findAll(Sort.by(Direction.DESC, "fechaEmision"));
    }

    @Override
    public Cotizacion findProforma(Long idproforma) {
        return this.proformaRepository.findById(idproforma).orElse(null);
    }

    // ------------------------------------------------------------------ consultas

    @Override
    @Transactional(readOnly = true)
    public Page<ProformaResumen> buscar(String termino, Date fechaIni, Date fechaFin, int idUsuario, Pageable pageable) {
        String t = termino == null ? "" : termino.trim();
        Date desde = fechaIni == null ? INICIO_DE_LOS_TIEMPOS : inicioDelDia(fechaIni);
        Date hasta = fechaFin == null ? new Date(4102444800000L) : diaSiguiente(fechaFin);   // 2100-01-01
        return proformaRepository.buscarResumen(t, desde, hasta, Math.max(idUsuario, 0), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DetalleProformaItem> findDetalle(Long idProforma, Pageable pageable) {
        return proformaRepository.findDetalle(idProforma, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean estaFacturada(Long idProforma) {
        return facturaRepository.existeFacturaVigenteDeProforma(idProforma);
    }

    // ----------------------------------------------------------- escritura

    @Override
    @Transactional
    public Cotizacion registrar(Cotizacion datos, Usuario usuario) {
        Cotizacion proforma = new Cotizacion();
        proforma.setCliente(clienteValido(datos));
        proforma.setUsuario(usuario);
        proforma.setEstado(estadoActivo());
        reemplazarLineas(proforma, datos);

        Cotizacion guardada = proformaRepository.saveAndFlush(proforma);
        guardada.setNoProforma(guardada.getIdProforma());       // el numero visible es el id
        return proformaRepository.save(guardada);
    }

    @Override
    @Transactional
    public Cotizacion actualizar(Long idProforma, Cotizacion datos) {
        Cotizacion proforma = existente(idProforma);
        exigirNoFacturada(idProforma, "No se puede modificar una proforma que ya fue facturada.");

        proforma.setCliente(clienteValido(datos));
        reemplazarLineas(proforma, datos);
        return proformaRepository.save(proforma);
    }

    @Override
    @Transactional
    public void eliminar(Long idProforma) {
        Cotizacion proforma = existente(idProforma);
        exigirNoFacturada(idProforma, "No se puede eliminar una proforma que ya fue facturada.");
        proformaRepository.delete(proforma);
    }

    private Cotizacion existente(Long idProforma) {
        return proformaRepository.findById(idProforma)
                .orElseThrow(() -> new ReglaNegocioException(HttpStatus.NOT_FOUND, "La proforma no se encuentra registrada."));
    }

    private void exigirNoFacturada(Long idProforma, String mensaje) {
        if (facturaRepository.existeFacturaVigenteDeProforma(idProforma)) {
            throw new ReglaNegocioException(HttpStatus.CONFLICT, mensaje);
        }
    }

    private Estado estadoActivo() {
        Estado estado = estadoService.findByEstado("ACTIVO");
        if (estado == null) {
            throw new ReglaNegocioException(HttpStatus.INTERNAL_SERVER_ERROR, "El estado ACTIVO no está configurado en el sistema.");
        }
        return estado;
    }

    private Cliente clienteValido(Cotizacion datos) {
        if (datos == null || datos.getCliente() == null || datos.getCliente().getIdCliente() == null) {
            throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "La proforma debe tener un cliente.");
        }
        Cliente cliente = clienteService.findById(datos.getCliente().getIdCliente());
        if (cliente == null) {
            throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "El cliente indicado no existe.");
        }
        return cliente;
    }

    /**
     * Reemplaza las lineas de la proforma por las recibidas, recalculando precios, descuentos y totales con el
     * catalogo (el cliente web no decide los montos).
     */
    private void reemplazarLineas(Cotizacion proforma, Cotizacion datos) {
        if (datos.getItemsProforma() == null || datos.getItemsProforma().isEmpty()) {
            throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "La proforma debe incluir al menos un producto.");
        }

        List<DetalleCotizacion> lineas = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (DetalleCotizacion recibida : datos.getItemsProforma()) {
            if (recibida == null || recibida.getProducto() == null || recibida.getProducto().getIdProducto() == null) {
                throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "Todas las líneas deben indicar un producto.");
            }
            if (recibida.getCantidad() == null || recibida.getCantidad() <= 0) {
                throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "La cantidad de todos los productos debe ser mayor a 0.");
            }
            float descuento = recibida.getDescuento() == null ? 0f : recibida.getDescuento();
            if (descuento < 0f || descuento > 100f) {
                throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "El descuento debe estar entre 0% y 100%.");
            }

            Producto producto = productoService.findById(recibida.getProducto().getIdProducto());
            if (producto == null || producto.getPrecioVenta() == null) {
                throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "Uno de los productos no existe o no tiene precio.");
            }

            BigDecimal precio = BigDecimal.valueOf(producto.getPrecioVenta()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal cantidad = BigDecimal.valueOf(recibida.getCantidad());
            // mismo calculo que el frontend: se redondea el precio ya descontado (no el descuento)
            BigDecimal precioConDescuento = precio.subtract(precio.multiply(BigDecimal.valueOf(descuento))
                    .divide(BigDecimal.valueOf(100))).setScale(2, RoundingMode.HALF_UP);

            DetalleCotizacion linea = new DetalleCotizacion();
            linea.setProducto(producto);
            linea.setCantidad(recibida.getCantidad());
            linea.setDescuento(descuento);
            linea.setPrecioUnitario(precio.doubleValue());
            linea.setSubTotal(precio.multiply(cantidad).setScale(2, RoundingMode.HALF_UP).doubleValue());
            BigDecimal importe = precioConDescuento.multiply(cantidad).setScale(2, RoundingMode.HALF_UP);
            linea.setSubTotalDescuento(importe.doubleValue());
            lineas.add(linea);
            total = total.add(importe);
        }

        // se modifica la coleccion administrada (no se reemplaza) para que orphanRemoval borre las lineas anteriores
        proforma.getItemsProforma().clear();
        proforma.getItemsProforma().addAll(lineas);
        proforma.setTotal(total.setScale(2, RoundingMode.HALF_UP).doubleValue());
    }

    // -------------------------------------------------------------- reportes

    @Override
    public byte[] generarPdf(Long idProforma) {
        if (!proformaRepository.existsById(idProforma)) {
            throw new ReglaNegocioException(HttpStatus.NOT_FOUND, "La proforma no se encuentra registrada.");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("idProforma", idProforma);
        try (Connection con = dataSource.getConnection(); InputStream plantilla = getClass().getResourceAsStream("/reports/proforma.jrxml")) {
            JasperReport reporte = JasperCompileManager.compileReport(plantilla);
            JasperPrint impresion = JasperFillManager.fillReport(reporte, params, con);
            return JasperExportManager.exportReportToPdf(impresion);
        } catch (Exception e) {
            throw new ReglaNegocioException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo generar la proforma: " + e.getMessage());
        }
    }

    @Override
    public byte[] reporteConversion(Date fechaIni, Date fechaFin, int idUsuario, String formato) {
        boolean xlsx = "XLSX".equalsIgnoreCase(formato);
        SimpleDateFormat visible = new SimpleDateFormat("dd/MM/yyyy");

        Map<String, Object> params = new HashMap<>();
        params.put(JRParameter.IS_IGNORE_PAGINATION, xlsx);
        params.put("ID_USUARIO", idUsuario);
        params.put("FECHA_INICIO", new Timestamp(inicioDelDia(fechaIni).getTime()));
        params.put("FECHA_FIN_EXCLUSIVA", new Timestamp(diaSiguiente(fechaFin).getTime()));
        params.put("RANGO", "Del " + visible.format(fechaIni) + " al " + visible.format(fechaFin));
        params.put("FORMATO", xlsx ? "XLSX" : "PDF");

        try (Connection con = dataSource.getConnection(); InputStream plantilla = getClass().getResourceAsStream("/reports/conversion_proformas.jrxml")) {
            JasperReport reporte = JasperCompileManager.compileReport(plantilla);
            JasperPrint impresion = JasperFillManager.fillReport(reporte, params, con);
            return xlsx ? exportarXlsx(impresion) : JasperExportManager.exportReportToPdf(impresion);
        } catch (Exception e) {
            throw new ReglaNegocioException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo generar el reporte de conversión: " + e.getMessage());
        }
    }

    private byte[] exportarXlsx(JasperPrint impresion) throws JRException {
        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        JRXlsxExporter exportador = new JRXlsxExporter();
        exportador.setExporterInput(new SimpleExporterInput(impresion));
        exportador.setExporterOutput(new SimpleOutputStreamExporterOutput(salida));
        SimpleXlsxReportConfiguration configuracion = new SimpleXlsxReportConfiguration();
        configuracion.setDetectCellType(true);
        configuracion.setRemoveEmptySpaceBetweenRows(true);
        configuracion.setWhitePageBackground(false);
        configuracion.setSheetNames(new String[] { "Conversión de proformas" });
        exportador.setConfiguration(configuracion);
        exportador.exportReport();
        return salida.toByteArray();
    }

    // ----------------------------------------------------------------- fechas

    private static Date inicioDelDia(Date fecha) {
        Calendar c = Calendar.getInstance();
        c.setTime(fecha);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTime();
    }

    /** Inicio del dia siguiente: permite filtrar con {@code fecha < limite} para que el ultimo dia sea inclusivo. */
    private static Date diaSiguiente(Date fecha) {
        Calendar c = Calendar.getInstance();
        c.setTime(inicioDelDia(fecha));
        c.add(Calendar.DAY_OF_MONTH, 1);
        return c.getTime();
    }
}
