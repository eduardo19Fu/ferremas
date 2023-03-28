package com.aglayatech.licorstore.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "pagos_parciales")
public class PagoParcial implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPagoParcial;

    private Double pago;

    @Temporal(TemporalType.DATE)
    private Date fechaPago;

    @Temporal(TemporalType.DATE)
    private Date fechaProximoPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nota_credito")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private NotaCredito notaCredito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Estado estado;

    @PrePersist
    public void prepersist() {
        this.fechaPago = new Date();
    }

    public Integer getIdPagoParcial() {
        return idPagoParcial;
    }

    public void setIdPagoParcial(Integer idPagoParcial) {
        this.idPagoParcial = idPagoParcial;
    }

    public Double getPago() {
        return pago;
    }

    public void setPago(Double pago) {
        this.pago = pago;
    }

    public Date getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(Date fechaPago) {
        this.fechaPago = fechaPago;
    }

    public Date getFechaProximoPago() {
        return fechaProximoPago;
    }

    public void setFechaProximoPago(Date fechaProximoPago) {
        this.fechaProximoPago = fechaProximoPago;
    }

    public NotaCredito getNotaCredito() {
        return notaCredito;
    }

    public void setNotaCredito(NotaCredito notaCredito) {
        this.notaCredito = notaCredito;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("PagoParcial{");
        sb.append("idPagoParcial=").append(idPagoParcial);
        sb.append(", pago=").append(pago);
        sb.append(", fechaPago=").append(fechaPago);
        sb.append(", fechaProximoPago=").append(fechaProximoPago);
        sb.append(", notaCredito=").append(notaCredito);
        sb.append(", estado=").append(estado);
        sb.append('}');
        return sb.toString();
    }
}
