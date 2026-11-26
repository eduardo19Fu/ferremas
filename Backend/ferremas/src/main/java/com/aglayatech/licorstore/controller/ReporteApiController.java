package com.aglayatech.licorstore.controller;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aglayatech.licorstore.service.ReporteService;

/** Reportes de gestion del modulo de reportes (solo ADMIN). Todos devuelven PDF (en linea) o Excel (descarga). */
@CrossOrigin(value = {"${ferremas.origins}"})
@RestController
@RequestMapping("/api/reportes")
@Secured(value = {"ROLE_ADMIN"})
public class ReporteApiController {

    private static final MediaType XLSX = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    @Autowired
    private ReporteService reporteService;

    /** modo = MAS_VENDIDOS (orden CANTIDAD o IMPORTE) | BAJA_ROTACION (umbral de unidades vendidas). */
    @GetMapping("/rotacion-productos")
    public ResponseEntity<byte[]> rotacionProductos(
            @RequestParam(defaultValue = "MAS_VENDIDOS") String modo,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaIni,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaFin,
            @RequestParam(defaultValue = "20") int limite,
            @RequestParam(defaultValue = "CANTIDAD") String orden,
            @RequestParam(defaultValue = "0") int umbral,
            @RequestParam(defaultValue = "PDF") String formato) {
        boolean xlsx = esXlsx(formato);
        boolean baja = "BAJA_ROTACION".equalsIgnoreCase(modo);
        byte[] archivo = baja
                ? reporteService.bajaRotacion(fechaIni, fechaFin, umbral, limite, xlsx)
                : reporteService.masVendidos(fechaIni, fechaFin, limite, orden, xlsx);
        return respuesta(archivo, baja ? "baja_rotacion" : "mas_vendidos", xlsx);
    }

    @GetMapping("/compras")
    public ResponseEntity<byte[]> compras(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaIni,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaFin,
            @RequestParam(defaultValue = "0") int idProveedor,
            @RequestParam(defaultValue = "PDF") String formato) {
        boolean xlsx = esXlsx(formato);
        return respuesta(reporteService.compras(fechaIni, fechaFin, idProveedor, xlsx), "compras", xlsx);
    }

    @GetMapping("/anulaciones")
    public ResponseEntity<byte[]> anulaciones(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaIni,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaFin,
            @RequestParam(defaultValue = "PDF") String formato) {
        boolean xlsx = esXlsx(formato);
        return respuesta(reporteService.anulaciones(fechaIni, fechaFin, xlsx), "anulaciones", xlsx);
    }

    @GetMapping("/cuentas-por-cobrar")
    public ResponseEntity<byte[]> cuentasPorCobrar(
            @RequestParam(defaultValue = "0") int idCliente,
            @RequestParam(defaultValue = "false") boolean soloVencidas,
            @RequestParam(defaultValue = "PDF") String formato) {
        boolean xlsx = esXlsx(formato);
        return respuesta(reporteService.cuentasPorCobrar(idCliente, soloVencidas, xlsx), "cuentas_por_cobrar", xlsx);
    }

    @GetMapping("/kardex")
    public ResponseEntity<byte[]> kardex(
            @RequestParam int idProducto,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaIni,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fechaFin,
            @RequestParam(defaultValue = "PDF") String formato) {
        boolean xlsx = esXlsx(formato);
        return respuesta(reporteService.kardex(idProducto, fechaIni, fechaFin, xlsx), "kardex_" + idProducto, xlsx);
    }

    private static boolean esXlsx(String formato) {
        return "XLSX".equalsIgnoreCase(formato);
    }

    private static ResponseEntity<byte[]> respuesta(byte[] archivo, String nombre, boolean xlsx) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, (xlsx ? "attachment" : "inline") + "; filename=" + nombre + (xlsx ? ".xlsx" : ".pdf"))
                .contentType(xlsx ? XLSX : MediaType.APPLICATION_PDF)
                .body(archivo);
    }
}
