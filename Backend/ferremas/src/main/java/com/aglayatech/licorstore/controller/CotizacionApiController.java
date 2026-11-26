package com.aglayatech.licorstore.controller;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aglayatech.licorstore.auth.TokenUsuario;
import com.aglayatech.licorstore.generics.ExcelExporter;
import com.aglayatech.licorstore.generics.ReglaNegocioException;
import com.aglayatech.licorstore.generics.SortParam;
import com.aglayatech.licorstore.model.Cotizacion;
import com.aglayatech.licorstore.model.Usuario;
import com.aglayatech.licorstore.model.dto.DetalleProformaItem;
import com.aglayatech.licorstore.model.dto.ProformaResumen;
import com.aglayatech.licorstore.service.ICotizacionService;
import com.aglayatech.licorstore.service.IUsuarioService;

/**
 * Proformas (cotizaciones). No mueven inventario; se pueden convertir en factura desde Nueva venta.
 */
@CrossOrigin(origins = { "*" })
@RestController
@RequestMapping("/api")
public class CotizacionApiController {

    /** Ordenamiento permitido del listado: clave publica -> ruta JPQL (las propiedades de la raiz van sin alias). */
    private static final Map<String, String> SORT_PROFORMA = Map.of(
            "idProforma", "idProforma", "noProforma", "noProforma", "fecha", "fechaEmision",
            "cliente", "c.nombre", "total", "total", "estado", "e.estado", "vendedor", "u.usuario");

    private static final Map<String, String> SORT_DETALLE = Map.of(
            "idDetalle", "idDetalle", "codProducto", "p.codProducto", "nombreProducto", "p.nombre",
            "cantidad", "cantidad", "precioUnitario", "precioUnitario", "descuento", "descuento",
            "subTotal", "subTotal", "subTotalDescuento", "subTotalDescuento");

    private static final MediaType XLSX = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    @Autowired
    private ICotizacionService proformaService;

    @Autowired
    private IUsuarioService usuarioService;

    // ---------------------------------------------------------------- consultas

    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @GetMapping("/proformas")
    public List<Cotizacion> index() {
        return this.proformaService.findAll();
    }

    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @GetMapping("/proformas/{id}")
    public ResponseEntity<?> findProforma(@PathVariable("id") Long id) {
        Cotizacion proforma = proformaService.findProforma(id);
        if (proforma == null) {
            throw new ReglaNegocioException(HttpStatus.NOT_FOUND, "La proforma no se encuentra registrada.");
        }
        return new ResponseEntity<Cotizacion>(proforma, HttpStatus.OK);
    }

    /** Listado paginado con busqueda (cliente, NIT o numero), rango de fechas y usuario opcionales. */
    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @GetMapping("/proformas/paginado")
    public Page<ProformaResumen> paginado(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaIni,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaFin,
            @RequestParam(defaultValue = "0") int idUsuario,
            @RequestParam(required = false) String sort) {
        int pageSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(Math.max(page, 0), pageSize, ordenListado(sort));
        return proformaService.buscar(search, fechaIni, fechaFin, idUsuario, pageable);
    }

    private Sort ordenListado(String sort) {
        return SortParam.parse(sort, SORT_PROFORMA, Sort.by(Sort.Direction.DESC, "fechaEmision"), "idProforma");
    }

    /** Detalle de una proforma (sus productos), paginado y ordenable; lo usa el modal de detalle. */
    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @GetMapping("/proformas/{id}/detalle")
    public Page<DetalleProformaItem> detalle(@PathVariable("id") Long idProforma,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        int pageSize = Math.min(Math.max(size, 1), 100);
        Sort order = SortParam.parse(sort, SORT_DETALLE, Sort.by("idDetalle").ascending(), "idDetalle");
        return proformaService.findDetalle(idProforma, PageRequest.of(Math.max(page, 0), pageSize, order));
    }

    /** Indica si la proforma ya fue convertida en una factura vigente (para bloquear editar, eliminar y re-facturar). */
    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @GetMapping("/proformas/{id}/facturada")
    public Map<String, Object> facturada(@PathVariable("id") Long idProforma) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("facturada", proformaService.estaFacturada(idProforma));
        return respuesta;
    }

    // ----------------------------------------------------------------- escritura

    /** Registra una proforma. El usuario que la emite se toma del token. */
    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @PostMapping("/proformas")
    public ResponseEntity<Map<String, Object>> create(@RequestBody Cotizacion proforma, @AuthenticationPrincipal Jwt jwt) {
        Usuario usuario = usuarioDelToken(jwt);
        if (usuario == null) {
            throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "No se pudo identificar al usuario que emite la proforma.");
        }
        Cotizacion nueva = proformaService.registrar(proforma, usuario);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "¡Proforma registrada!");
        respuesta.put("proforma", nueva);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @PutMapping("/proformas/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable("id") Long id, @RequestBody Cotizacion proforma) {
        Cotizacion actualizada = proformaService.actualizar(id, proforma);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "¡Proforma actualizada!");
        respuesta.put("proforma", actualizada);
        return new ResponseEntity<>(respuesta, HttpStatus.OK);
    }

    @Secured(value = {"ROLE_ADMIN"})
    @DeleteMapping("/proformas/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Long id) {
        proformaService.eliminar(id);
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "¡Proforma eliminada!");
        return new ResponseEntity<>(respuesta, HttpStatus.OK);
    }

    private Usuario usuarioDelToken(Jwt jwt) {
        Integer id = TokenUsuario.idUsuario(jwt);
        return id == null ? null : usuarioService.findById(id);
    }

    // ------------------------------------------------------------------ reportes

    /** PDF de la proforma (media carta no: tamano carta, varias paginas si hace falta). */
    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @GetMapping("/proformas/generate/{id}")
    public ResponseEntity<byte[]> generate(@PathVariable("id") Long idProforma) {
        byte[] pdf = proformaService.generarPdf(idProforma);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=proforma-" + idProforma + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /** Exporta a Excel todas las proformas que coinciden con los filtros del listado. */
    @Secured(value = {"ROLE_ADMIN", "ROLE_COBRADOR"})
    @GetMapping("/proformas/exportar")
    public ResponseEntity<byte[]> exportar(@RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaIni,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaFin,
            @RequestParam(defaultValue = "0") int idUsuario,
            @RequestParam(required = false) String sort) throws IOException {
        Sort orden = ordenListado(sort);

        List<ExcelExporter.Columna<ProformaResumen>> columnas = List.of(
                ExcelExporter.columna("No. proforma", 14, ExcelExporter.Tipo.ENTERO, ProformaResumen::noProforma),
                ExcelExporter.columna("Fecha", 16, ExcelExporter.Tipo.FECHA_HORA, ProformaResumen::fechaEmision),
                ExcelExporter.columna("Cliente", 36, ExcelExporter.Tipo.TEXTO, ProformaResumen::cliente),
                ExcelExporter.columna("NIT", 14, ExcelExporter.Tipo.TEXTO, ProformaResumen::nit),
                ExcelExporter.columna("Vendedor", 16, ExcelExporter.Tipo.TEXTO, ProformaResumen::vendedor),
                ExcelExporter.columna("Total", 14, ExcelExporter.Tipo.MONEDA, ProformaResumen::total),
                ExcelExporter.columna("Estado", 12, ExcelExporter.Tipo.TEXTO, ProformaResumen::estado),
                ExcelExporter.columna("Factura", 12, ExcelExporter.Tipo.ENTERO, ProformaResumen::noFactura));

        byte[] archivo = ExcelExporter.exportar("Proformas", columnas, orden,
                pageable -> proformaService.buscar(search, fechaIni, fechaFin, idUsuario, pageable));
        return ExcelExporter.respuesta("proformas", archivo);
    }

    /** Reporte de conversion de proformas a facturas por usuario (PDF o Excel). */
    @Secured(value = {"ROLE_ADMIN"})
    @GetMapping("/proformas/conversion")
    public ResponseEntity<byte[]> conversion(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaIni,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaFin,
            @RequestParam(defaultValue = "0") int idUsuario,
            @RequestParam(defaultValue = "PDF") String formato) {
        if (fechaFin.before(fechaIni)) {
            throw new ReglaNegocioException(HttpStatus.BAD_REQUEST, "La fecha final no puede ser anterior a la inicial.");
        }
        boolean xlsx = "XLSX".equalsIgnoreCase(formato);
        byte[] archivo = proformaService.reporteConversion(fechaIni, fechaFin, idUsuario, xlsx ? "XLSX" : "PDF");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, (xlsx ? "attachment" : "inline") + "; filename=conversion_proformas." + (xlsx ? "xlsx" : "pdf"))
                .contentType(xlsx ? XLSX : MediaType.APPLICATION_PDF)
                .body(archivo);
    }
}
