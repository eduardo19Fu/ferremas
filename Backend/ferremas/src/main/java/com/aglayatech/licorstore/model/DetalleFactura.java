package com.aglayatech.licorstore.model;

import java.io.Serializable;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "facturas_detalle")
public class DetalleFactura implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idDetalle;
	private Integer cantidad;
	private Double subTotal;
	private Double descuento;
	private Double subTotalDescuento;
	private Double precioUnitario;


	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_producto")
	@JsonIgnoreProperties({ "movimientos", "hibernateLazyInitializer", "handler" })
	private Producto producto;

	public DetalleFactura() {
		// constructor
	}

	public Long getIdDetalle() {
		return idDetalle;
	}

	public void setIdDetalle(Long idDetalle) {
		this.idDetalle = idDetalle;
	}

	public Integer getCantidad() {
		return cantidad;
	}

	public void setCantidad(Integer cantidad) {
		this.cantidad = cantidad;
	}

	public Double getSubTotal() {
		return subTotal;
	}

	public void setSubTotal(Double subTotal) {
		this.subTotal = subTotal;
	}

	public Producto getProducto() {
		return producto;
	}

	public void setProducto(Producto producto) {
		this.producto = producto;
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

	public Double getPrecioUnitario() {
		return precioUnitario;
	}

	public void setPrecioUnitario(Double precioUnitario) {
		this.precioUnitario = precioUnitario;
	}

	public Double calcularImporte() {
		/*if(this.descuento == 0)
			return this.cantidad.doubleValue() * this.producto.getPrecioVenta();
		else
			return (this.descuento/100) * (this.cantidad.doubleValue() * this.producto.getPrecioVenta());*/

		return this.descuento <= 0 ? this.cantidad.doubleValue() * this.producto.getPrecioVenta() :
				(this.cantidad.doubleValue() * this.producto.getPrecioVenta()) - ((this.descuento / 100) * (this.cantidad.doubleValue() * this.producto.getPrecioVenta()));
	}

	@Override
	public String toString() {
		final StringBuilder sb = new StringBuilder("DetalleFactura{");
		sb.append("idDetalle=").append(idDetalle);
		sb.append(", cantidad=").append(cantidad);
		sb.append(", subTotal=").append(subTotal);
		sb.append(", descuento=").append(descuento);
		sb.append(", subTotalDescuento=").append(subTotalDescuento);
		sb.append(", precioUnitario=").append(precioUnitario);
		sb.append(", producto=").append(producto);
		sb.append('}');
		return sb.toString();
	}

	private static final long serialVersionUID = 1L;

}
