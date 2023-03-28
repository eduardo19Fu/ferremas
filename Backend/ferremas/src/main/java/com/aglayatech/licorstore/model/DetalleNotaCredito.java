package com.aglayatech.licorstore.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.io.Serializable;

@Entity
@Table(name = "notas_credito_detalle")
public class DetalleNotaCredito implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idNotaDetalle;

    private Double subTotal;
    private int cantidad;
    private Double descuento;
    private Double subTotalDescuento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Producto producto;

    public Integer getIdNotaDetalle() {
        return idNotaDetalle;
    }

    public void setIdNotaDetalle(Integer idNotaDetalle) {
        this.idNotaDetalle = idNotaDetalle;
    }

    public Double getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(Double subTotal) {
        this.subTotal = subTotal;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public Double getDescuento() {
        return descuento;
    }

    public void setDescuento(Double descuento) {
        this.descuento = descuento;
    }

    public Double getSubTotalDescuento() {
        return subTotalDescuento;
    }

    public void setSubTotalDescuento(Double subTotalDescuento) {
        this.subTotalDescuento = subTotalDescuento;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("NotaCreditoDetalle{");
        sb.append("idNotaDetalle=").append(idNotaDetalle);
        sb.append(", subTotal=").append(subTotal);
        sb.append(", cantidad=").append(cantidad);
        sb.append(", descuento=").append(descuento);
        sb.append(", subTotalDescuento=").append(subTotalDescuento);
        sb.append(", producto=").append(producto);
        sb.append('}');
        return sb.toString();
    }
}
