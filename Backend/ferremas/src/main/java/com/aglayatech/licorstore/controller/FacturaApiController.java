package com.aglayatech.licorstore.controller;

import java.io.*;
import java.lang.reflect.InvocationTargetException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletResponse;

import com.aglayatech.licorstore.generics.ErroresHandler;
import com.aglayatech.licorstore.generics.Excepcion;
import com.aglayatech.licorstore.generics.ExcelExporter;
import com.aglayatech.licorstore.model.*;
import com.aglayatech.licorstore.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.sf.jasperreports.engine.JRException;

@CrossOrigin(origins = {"${ferremas.origins}"})
@RestController
@RequestMapping(value = {"/api"})
public class FacturaApiController {

    @Autowired
    private IFacturaService serviceFactura;

    @Autowired
    private IProductoService serviceProducto;

    @Autowired
    private com.aglayatech.licorstore.service.ICotizacionService serviceProforma;

    @Autowired
    private IEstadoService serviceEstado;

    @Autowired
    private ICorrelativoService serviceCorrelativo;

    @Autowired
    private IMovimientoProductoService serviceMovimiento;

    @Autowired
    private IUsuarioService serviceUsuario;

    // Inyeccion para capturar el Emisor del Regimen FEL
    @Autowired
    private IEmisorService serviceEmisor;

    // Inyeccion para capturar el Certificador del Regimen FEL
    @Autowired
    private ICertificadorService serviceCertificador;

    @Autowired
    private ITipoFacturaService serviceTipoFactura;

    @Autowired
    private IEnvioService serviceEnvio;

    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @GetMapping(value = "/facturas")
    public List<Factura> index() {
        return this.serviceFactura.findAll();
    }

    @GetMapping(value = "/facturas/page/{page}")
    public Page<Factura> index(@PathVariable("page") Integer page) {
        return this.serviceFactura.findAll(PageRequest.of(page, 5));
    }

    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @GetMapping(value = "/facturas/factura/{id}")
    public ResponseEntity<?> showFactura(@PathVariable("id") Long idfactura) {

        Factura factura = null;
        Map<String, Object> response = new HashMap<>();

        try {
            factura = serviceFactura.findFactura(idfactura);
        } catch (DataAccessException e) {
            response.put("mensaje", "¡Error en la base de datos!");
            response.put("error", e.getMessage().concat(": ").concat(e.getMostSpecificCause().getMessage()));
            return new ResponseEntity<Map<String, Object>>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (factura == null) {
            response.put("mensaje", "¡La factura con id ".concat(idfactura.toString()).concat(" no existe en la base de datos!"));
            return new ResponseEntity<Map<String, Object>>(response, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<Factura>(factura, HttpStatus.OK);

    }

    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @GetMapping(value = "/facturas/fecha")
    public ResponseEntity<?> consultarFacturasPorFecha(@RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaIni,
                                                        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaFin)
    {
        Map<String, Object> response = new HashMap<>();
        List<Factura> facturas = new ArrayList<>();

        try {
             facturas = serviceFactura.findFacturasPorFechas(fechaIni, fechaFin);
        } catch (DataAccessException e) {
            response.put("mensaje", "¡Error en la base de datos!");
            response.put("error", e.getMessage().concat(": ").concat(e.getMostSpecificCause().getMessage()));
            return new ResponseEntity<Map<String, Object>>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if(facturas.isEmpty()) {
            response.put("mensaje", "No existen facturas registradas en el rango de fechas especificado");
            return new ResponseEntity<>(response, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(facturas, HttpStatus.OK);
    }

    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @PostMapping(value = "/facturas")
    public ResponseEntity<?> create(@RequestBody Factura factura, BindingResult result) {

        Factura newFactura = null;
        Envio envio = null;

        Estado estado = serviceEstado.findByEstado("PAGADO");
        Estado estadoCorr = serviceEstado.findByEstado("ACTIVO");
        Estado estadoCorrFinalizado = serviceEstado.findByEstado("FINALIZADO");
        TipoFactura tipoFactura = serviceTipoFactura.getTipoFactura(1);
        Correlativo correlativo = serviceCorrelativo.findByUsuario(factura.getUsuario(), estadoCorr);

        List<Estado> estados = new ArrayList<>();
        Map<String, Object> response = new HashMap<>();

        if (result.hasErrors()) {
            return new ResponseEntity<Map<String, Object>>(ErroresHandler.bingingResultErrorsHandler(result), HttpStatus.BAD_REQUEST);
        }

        // Factura que convierte una proforma: la proforma debe existir y no tener ya una factura vigente
        if (factura.getIdProformaOrigen() != null) {
            if (serviceProforma.findProforma(factura.getIdProformaOrigen()) == null) {
                response.put("mensaje", "La proforma de origen no existe.");
                return new ResponseEntity<Map<String, Object>>(response, HttpStatus.BAD_REQUEST);
            }
            if (serviceProforma.estaFacturada(factura.getIdProformaOrigen())) {
                response.put("mensaje", "La proforma ya fue convertida en una factura vigente.");
                response.put("error", "Anule esa factura si desea volver a facturar la proforma.");
                return new ResponseEntity<Map<String, Object>>(response, HttpStatus.CONFLICT);
            }
        }

        try {

            /******************* PROCEDIMIENTO SIN REGIMEN FEL ******************/
            factura.setEstado(estado);
            estados = serviceEstado.findAll();

            if (correlativo != null) {
                newFactura = serviceFactura.save(factura);

                if (newFactura != null) {
                    correlativo.setCorrelativoActual(correlativo.getCorrelativoActual() + 1);

                    if (correlativo.getCorrelativoActual() > correlativo.getCorrelativoFinal()) {
                        correlativo.setEstado(estadoCorrFinalizado);
                        correlativo.setCorrelativoActual(correlativo.getCorrelativoFinal());
                    }

                    serviceCorrelativo.save(correlativo);

                    // Actualiza el stock de los productos que forman parte de cada una de las lineas de la factura
                    for (DetalleFactura item : newFactura.getItemsFactura()) {
                        if (this.updateExistencias(item.getProducto(), item.getCantidad(), "venta".toUpperCase())){
                            this.movimiento(item.getProducto(), newFactura, item.getCantidad(), "venta".toUpperCase());
                        }
                    }
                } else {
                    response.put("mensaje", "Factura no pudo ser registrada..");
                    return new ResponseEntity<Map<String, Object>>(response, HttpStatus.BAD_REQUEST);
                }
            } else {
                response.put("mensaje", "No existe correlativo activo para este usuario.");
                return new ResponseEntity<Map<String, Object>>(response, HttpStatus.BAD_REQUEST);
            }

            // ACTUALIZAR LOS ESTADOS Y LA FACTURA DEL ENVIO
            if (factura.getTipoFactura().getIdTipoFactura() == 3) {
                envio = factura.getEnvio();
                envio.setEstados(Envio.determinarEstadosEnvio(2, estados));
                envio.setFactura(newFactura);

                serviceEnvio.save(envio);
            }


        } catch (DataAccessException e) {
            response.put("mensaje", "¡Error en la base de datos!");
            response.put("error", e.getMessage().concat(": ").concat(e.getMostSpecificCause().getMessage()));
            return new ResponseEntity<Map<String, Object>>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        response.put("mensaje", "¡Factura creada!");
        response.put("factura", newFactura);
        return new ResponseEntity<Map<String, Object>>(response, HttpStatus.CREATED);
    }

    @Secured(value = {"ROLE_COBRADOR", "ROLE_ADMIN"})
    @DeleteMapping(value = "/facturas/cancel/{id}/{idusuario}")
    public ResponseEntity<?> cancel(@PathVariable("id") Long idfactura, @PathVariable("idusuario") Integer idusuario) {

        Map<String, Object> response = new HashMap<>();

        Factura cancelFactura = null;
        Estado estado = null;
        Usuario usuario = null;
        MovimientoProducto movimientoProducto = null;

        // DATOS RECOLECTADOS PARA FIRMAR PETICION AL CERTIFICADOR
        Emisor emisor = null;
        Certificador certificador = null;

        try {
            cancelFactura = serviceFactura.findFactura(idfactura);
            estado = serviceEstado.findByEstado("ANULADO");
            usuario = serviceUsuario.findById(idusuario);


            if (estado != null) {

                /******************* PROCEDIMIENTO SIN REGIMEN FEL ******************/

                cancelFactura.setEstado(estado);

                // Recorre el listado de items de la factura y retorna al stock la cantidad comprada
                for (DetalleFactura linea : cancelFactura.getItemsFactura()) {
                    if (this.updateExistencias(linea.getProducto(), linea.getCantidad(), "anulacion factura".toUpperCase())) {
                        this.movimiento(linea.getProducto(), cancelFactura, linea.getCantidad(), "anulacion factura".toUpperCase());
                    }
                }

                serviceFactura.save(cancelFactura);

            } else {
                response.put("mensaje", "Estado no localizado");
                response.put("error", "El estado de anulado no pudo ser localizado");
                return new ResponseEntity<Map<String, Object>>(response, HttpStatus.NOT_FOUND);
            }

        } catch (DataAccessException e) {
            response.put("mensaje", "¡Error en la base de datos!");
            response.put("error", e.getMessage().concat(": ").concat(e.getMostSpecificCause().getMessage()));
            return new ResponseEntity<Map<String, Object>>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        response.put("mensaje", "¡Factura Anulada!");
        response.put("factura", cancelFactura);
        return new ResponseEntity<Map<String, Object>>(response, HttpStatus.CREATED);
    }

    @GetMapping("/facturas/max-ventas/get")
    public ResponseEntity<?> getMaxVentasController() {
        Integer maxVentas = 0;
        Map<String, Object> response = new HashMap<>();

        try {
            maxVentas = serviceFactura.getMaxVentas();
        } catch (DataAccessException e) {
            return new ResponseEntity<Map<String, Object>>(Excepcion.dataAccessExceptionHandler(e), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<Integer>(maxVentas, HttpStatus.OK);
    }

    @Secured(value = "ROLE_ADMIN")
    @DeleteMapping("/facturas/eliminar/fecha")
    public ResponseEntity<?> eliminarFacturasPorFecha(@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
                                                      @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate)
    {
        Map<String, Object> response = new HashMap<>();
        int cantidad = 0;

        try {
            cantidad = serviceFactura.deleteByRangoFechas(startDate, endDate);
        } catch(DataAccessException e) {
            response.put("mensaje", "¡Error en la base de datos!");
            response.put("error", e.getMessage().concat(": ").concat(e.getMostSpecificCause().getMessage()));
            return new ResponseEntity<Map<String, Object>>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        response.put("mensaje", "Se eliminaron " + cantidad + " de facturas en el rango de fechas específicado");
        response.put("cantidad", cantidad);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /*************** PDF REPORTS CONTROLLERS ********************/

    // CONTROLADOR DE FACTURA
    @GetMapping(value = "/facturas/generate/{id}")
    public void generateBill(@PathVariable("id") Long idfactura, HttpServletResponse httpServletResponse)
            throws JRException, SQLException, FileNotFoundException {


        try {
            byte[] bytesFactura = serviceFactura.showBill(idfactura);
            ByteArrayOutputStream out = new ByteArrayOutputStream(bytesFactura.length);
            out.write(bytesFactura, 0, bytesFactura.length);

            httpServletResponse.setContentType("application/pdf");
            httpServletResponse.addHeader("Content-Disposition", "inline; filename=bill-" + idfactura + ".pdf");

            OutputStream os;

            os = httpServletResponse.getOutputStream();
            out.writeTo(os);
            os.flush();
            os.close();
        } catch (IOException e) {
            // new ServletException(e);
            e.printStackTrace();
        }
    }

    // CONTROLADOR VENTAS DIARIAS
    @GetMapping(value = "/facturas/daily-sales")
    public void dailySales(@RequestParam("usuario") String usuario, @RequestParam("fecha") String fecha, HttpServletResponse httpServletResponse)
            throws FileNotFoundException, JRException, SQLException, ParseException {

        Date fechaBusqueda;
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        fechaBusqueda = format.parse(fecha);
        Integer idusuario = Integer.parseInt(usuario);

        byte[] bytesDailySalesReport = serviceFactura.resportDailySales(idusuario, fechaBusqueda);
        ByteArrayOutputStream out = new ByteArrayOutputStream(bytesDailySalesReport.length);
        out.write(bytesDailySalesReport, 0, bytesDailySalesReport.length);

        httpServletResponse.setContentType("application/pdf");
        httpServletResponse.addHeader("Content-Disposition", "inline; filename=daily-sales.pdf");

        OutputStream os;
        try {
            os = httpServletResponse.getOutputStream();
            out.writeTo(os);
            os.flush();
            os.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    /** Reporte de ventas diarias (facturas vigentes de un dia) en PDF o Excel. */
    @Secured(value = {"ROLE_ADMIN"})
    @GetMapping(value = "/facturas/ventas-diarias")
    public ResponseEntity<byte[]> ventasDiarias(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fecha,
            @RequestParam(defaultValue = "0") int idUsuario,
            @RequestParam(defaultValue = "PDF") String formato) {
        boolean xlsx = "XLSX".equalsIgnoreCase(formato);
        byte[] archivo = serviceFactura.reporteVentasDiarias(fecha, idUsuario, xlsx ? "XLSX" : "PDF");

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        (xlsx ? "attachment" : "inline") + "; filename=ventas_diarias." + (xlsx ? "xlsx" : "pdf"))
                .contentType(xlsx
                        ? org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                        : org.springframework.http.MediaType.APPLICATION_PDF)
                .body(archivo);
    }

    private boolean updateExistencias(Producto producto, int cantidad, String tipoMovimiento) {
        Producto productoUpdated = new Producto();

        if (tipoMovimiento.equals("venta".toUpperCase())) {
            producto.setStock(producto.getStock() - cantidad);
        } else if (tipoMovimiento.equals("anulacion factura".toUpperCase())) {
            producto.setStock(producto.getStock() + cantidad);
        }

        productoUpdated = serviceProducto.save(producto);
        return (productoUpdated != null ? true : false);
    }

    private void movimiento(Producto producto, Factura factura, int cantidad, String tipoMovimiento) {
        MovimientoProducto movimiento = new MovimientoProducto();

        movimiento.setTipoMovimiento(serviceMovimiento.findTipoMovimiento(tipoMovimiento));
        movimiento.setUsuario(factura.getUsuario());
        movimiento.setProducto(producto);
        movimiento.setStockInicial(producto.getStock());
        movimiento.setCantidad(cantidad);

        serviceMovimiento.save(movimiento);
    }

	// Las consultas de busqueda usan "left join f.cliente c": se ordena por el alias para conservar las facturas sin cliente
	private static final java.util.Map<String, String> SORT_FACTURA = java.util.Map.of(
			"idFactura", "idFactura", "noFactura", "noFactura", "fecha", "fecha", "cliente.nombre", "c.nombre",
			"total", "total", "estado.estado", "estado.estado", "usuario.usuario", "usuario.usuario");

	@GetMapping("/facturas/paginado")
	public org.springframework.data.domain.Page<Factura> paginado(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaIni,
			@RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaFin,
			@RequestParam(required = false) String sort) {
		int pageSize = Math.min(Math.max(size, 1), 100);
		org.springframework.data.domain.Sort order = com.aglayatech.licorstore.generics.SortParam.parse(sort, SORT_FACTURA, org.springframework.data.domain.Sort.by("idFactura").descending(), "idFactura");
		org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(Math.max(page, 0), pageSize, order);
		if (fechaIni != null && fechaFin != null) {
			return serviceFactura.searchPorFechas(search, fechaIni, fechaFin, pageable);
		}
		return serviceFactura.search(search, pageable);
	}

	private static final java.util.Map<String, String> SORT_DETALLE_FACTURA = java.util.Map.of(
			"idDetalle", "idDetalle", "codProducto", "p.codProducto", "nombreProducto", "p.nombre",
			"cantidad", "cantidad", "precioUnitario", "precioUnitario", "subTotal", "subTotal",
			"descuento", "descuento", "subTotalDescuento", "subTotalDescuento");

	/** Detalle de una factura (sus productos), paginado y ordenable; lo usa el modal de detalle. */
	@Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
	@GetMapping("/facturas/{id}/detalle")
	public org.springframework.data.domain.Page<com.aglayatech.licorstore.model.dto.DetalleFacturaItem> detalle(
			@PathVariable("id") Long idFactura,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String sort) {
		int pageSize = Math.min(Math.max(size, 1), 100);
		org.springframework.data.domain.Sort order = com.aglayatech.licorstore.generics.SortParam.parse(sort, SORT_DETALLE_FACTURA, org.springframework.data.domain.Sort.by("idDetalle").ascending(), "idDetalle");
		return serviceFactura.findDetalle(idFactura, org.springframework.data.domain.PageRequest.of(Math.max(page, 0), pageSize, order));
	}

	/** Exporta a Excel todas las facturas que coinciden con la busqueda y el rango de fechas del listado. */
	@Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
	@GetMapping("/facturas/exportar")
	public ResponseEntity<byte[]> exportar(@RequestParam(required = false) String search,
			@RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaIni,
			@RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaFin,
			@RequestParam(required = false) String sort) throws java.io.IOException {
		org.springframework.data.domain.Sort orden = com.aglayatech.licorstore.generics.SortParam.parse(sort, SORT_FACTURA, org.springframework.data.domain.Sort.by("idFactura").descending(), "idFactura");

		java.util.List<ExcelExporter.Columna<Factura>> columnas = java.util.List.of(
				ExcelExporter.columna("ID", 9, ExcelExporter.Tipo.ENTERO, Factura::getIdFactura),
				ExcelExporter.columna("No. factura", 13, ExcelExporter.Tipo.ENTERO, Factura::getNoFactura),
				ExcelExporter.columna("Serie", 10, ExcelExporter.Tipo.TEXTO, Factura::getSerie),
				ExcelExporter.columna("Fecha", 13, ExcelExporter.Tipo.FECHA, Factura::getFecha),
				ExcelExporter.columna("Cliente", 36, ExcelExporter.Tipo.TEXTO, f -> f.getCliente() == null ? null : f.getCliente().getNombre()),
				ExcelExporter.columna("NIT", 14, ExcelExporter.Tipo.TEXTO, f -> f.getCliente() == null ? null : f.getCliente().getNit()),
				ExcelExporter.columna("Total", 14, ExcelExporter.Tipo.MONEDA, Factura::getTotal),
				ExcelExporter.columna("Estado", 12, ExcelExporter.Tipo.TEXTO, f -> f.getEstado() == null ? null : f.getEstado().getEstado()),
				ExcelExporter.columna("Emisor", 16, ExcelExporter.Tipo.TEXTO, f -> f.getUsuario() == null ? null : f.getUsuario().getUsuario()));

		byte[] archivo = ExcelExporter.exportar("Facturas", columnas, orden, pageable ->
				(fechaIni != null && fechaFin != null)
						? serviceFactura.searchPorFechas(search, fechaIni, fechaFin, pageable)
						: serviceFactura.search(search, pageable));
		return ExcelExporter.respuesta("facturas", archivo);
	}
}
