package com.aglayatech.licorstore.controller;

import com.aglayatech.licorstore.generics.ErroresHandler;
import com.aglayatech.licorstore.model.Estado;
import com.aglayatech.licorstore.model.NotaCredito;
import com.aglayatech.licorstore.model.PagoParcial;
import com.aglayatech.licorstore.model.Usuario;
import com.aglayatech.licorstore.service.IEstadoService;
import com.aglayatech.licorstore.service.INotaCreditoService;
import com.aglayatech.licorstore.service.IPagoParcialService;
import com.aglayatech.licorstore.service.IUsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(value = {"${ferremas.origins}"})
@RestController
@RequestMapping(value = "/api/pagos-parciales")
public class PagoParcialApiController {

    private static final Logger logger = LoggerFactory.getLogger(PagoParcialApiController.class);

    @Autowired
    private IPagoParcialService pagoParcialService;

    @Autowired
    private IEstadoService estadoService;

    @Autowired
    private IUsuarioService usuarioService;

    @Autowired
    private INotaCreditoService notaCreditoService;

    @GetMapping(value = "/")
    public List<PagoParcial> index() {
        return pagoParcialService.findPagosParciales();
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<?> getPagoParcial(@PathVariable("id") Integer idpagoparcial) {

        Map<String, Object> response = new HashMap<>();
        PagoParcial pagoParcial = null;

        try {
            logger.info("Buscando pago parcial con ID: {}", idpagoparcial);
            pagoParcial = pagoParcialService.findPagoParcial(idpagoparcial);
            logger.info("Pago Parcial: {}", pagoParcial);
        } catch (DataAccessException e) {
            logger.error("Error durante el consumo del API => {}", e.getMessage());
            response.put("mensaje", "¡Ha ocurrido un error en la base de datos!");
            response.put("error", e.getMessage().concat(": ").concat(e.getMostSpecificCause().getMessage()));
            return new ResponseEntity<Map<String, Object>>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if(pagoParcial == null) {
            logger.warn("Pago Parcial con ID: {}" + idpagoparcial.toString() + "no encontrado");
            response.put("mensaje","Pago parcial con ID: ".concat(idpagoparcial.toString()).concat(" no encontrador"));
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(pagoParcial, HttpStatus.OK);
    }

    @PostMapping(value = "/")
    public ResponseEntity<?> create(@RequestBody PagoParcial pagoParcial, BindingResult result) {
        Map<String, Object> response = new HashMap<>();
        PagoParcial newPagoParcial = null;
        Estado estado = null;
        NotaCredito notaCredito = null;
        NotaCredito newNotaCredito = null;

        if(result.hasErrors()) {
            return new ResponseEntity<>(ErroresHandler.bingingResultErrorsHandler(result), HttpStatus.BAD_REQUEST);
        }

        try {
            estado = estadoService.findById(3);
            logger.debug("Estado obtenido -> {}", estado);

            pagoParcial.setEstado(estado);
            logger.debug("Pago Parcial con estado actualizado a operar: {}", pagoParcial);

            notaCredito = pagoParcial.getNotaCredito();
            logger.debug("Nota de Credito obtenida de la Request: {}", notaCredito);

            pagoParcial.setNotaCredito(updateSaldoNotaCredito(notaCredito, pagoParcial.getPago()));

            // notaCreditoService.save(pagoParcial.getNotaCredito());
            newPagoParcial = pagoParcialService.save(pagoParcial);
            newPagoParcial.setFechaProximoPago(determinarFechaProximoPago(newPagoParcial.getFechaPago()));
            pagoParcialService.save(newPagoParcial);
            logger.info("Pago parcial almacenado en la Base de Datos: {}", newPagoParcial);

        } catch(DataAccessException e) {
            logger.error("Error durante el consumo del API => {}", e.getMessage());
            response.put("mensaje", "¡Ha ocurrido un error en la base de datos!");
            response.put("error", e.getMessage().concat(": ").concat(e.getMostSpecificCause().getMessage()));
            return new ResponseEntity<Map<String, Object>>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        response.put("mensaje", "¡Pago realizado con éxito!");
        response.put("pagoParcial", newPagoParcial);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    private NotaCredito updateSaldoNotaCredito(NotaCredito notaCredito, Double totalPago) {
        double restanteAnterior = notaCredito.getRestante();
        double newRestante = restanteAnterior - totalPago;
        notaCredito.setRestante(newRestante);
        return notaCredito;
    }

    /**
     * Método que devuelve la próxima fecha de pago
     * @param fechaPago fecha de pago que es determinada en la nota de credito
     * @return Date
     * */
    private Date determinarFechaProximoPago(Date fechaPago) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(fechaPago);
        calendar.add(Calendar.MONTH, 1);
        return calendar.getTime();
    }
}
