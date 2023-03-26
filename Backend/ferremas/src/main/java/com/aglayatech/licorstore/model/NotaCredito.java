package com.aglayatech.licorstore.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.io.Serializable;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "notas_credito")
public class NotaCredito implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idNotaCredito;

    private Double abono;
    private Double total;
    private Double restante;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaCreacion;

    @Temporal(TemporalType.DATE)
    private Date fechaPagoLimite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Estado estado;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "id_nota_credito")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private List<DetalleNotaCredito> items;

    @PrePersist
    public void prepersist() {
        this.fechaCreacion = new Date();
    }

    public Integer getIdNotaCredito() {
        return idNotaCredito;
    }

    public void setIdNotaCredito(Integer idNotaCredito) {
        this.idNotaCredito = idNotaCredito;
    }

    public Double getAbono() {
        return abono;
    }

    public void setAbono(Double abono) {
        this.abono = abono;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public Double getRestante() {
        return restante;
    }

    public void setRestante(Double restante) {
        this.restante = restante;
    }

    public Date getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Date fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Date getFechaPagoLimite() {
        return fechaPagoLimite;
    }

    public void setFechaPagoLimite(Date fechaPagoLimite) {
        this.fechaPagoLimite = fechaPagoLimite;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public List<DetalleNotaCredito> getItems() {
        return items;
    }

    public void setItems(List<DetalleNotaCredito> items) {
        this.items = items;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("NotaCredito{");
        sb.append("idNotaCredito=").append(idNotaCredito);
        sb.append(", abono=").append(abono);
        sb.append(", total=").append(total);
        sb.append(", restante=").append(restante);
        sb.append(", fechaCreacion=").append(fechaCreacion);
        sb.append(", fechaPagoLimite=").append(fechaPagoLimite);
        sb.append(", usuario=").append(usuario);
        sb.append(", estado=").append(estado);
        sb.append('}');
        return sb.toString();
    }
}
