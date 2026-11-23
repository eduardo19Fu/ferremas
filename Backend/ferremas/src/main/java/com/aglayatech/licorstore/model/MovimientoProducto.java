package com.aglayatech.licorstore.model;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "movimientos_producto")
public class MovimientoProducto implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idMovimiento;
	private Integer cantidad;
	private Integer stockInicial;

	@Temporal(TemporalType.TIMESTAMP)
	private Date fechaMovimiento;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_producto")
	@JsonIgnoreProperties({ "movimientos", "hibernateLazyInitializer", "handler" })
	private Producto producto;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_usuario")
	@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_tipo_movimiento")
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
	private TipoMovimiento tipoMovimiento;
	
	@PrePersist
	public void configFecha() {
		this.fechaMovimiento = new Date();
	}

	public Long getIdMovimiento() {
		return idMovimiento;
	}

	public void setIdMovimiento(Long idMovimiento) {
		this.idMovimiento = idMovimiento;
	}

	public TipoMovimiento getTipoMovimiento() {
		return tipoMovimiento;
	}

	public void setTipoMovimiento(TipoMovimiento tipoMovimiento) {
		this.tipoMovimiento = tipoMovimiento;
	}

	public Integer getCantidad() {
		return cantidad;
	}

	public void setCantidad(Integer cantidad) {
		this.cantidad = cantidad;
	}

	public Date getFechaMovimiento() {
		return fechaMovimiento;
	}

	public void setFechaMovimiento(Date fechaMovimiento) {
		this.fechaMovimiento = fechaMovimiento;
	}

	public Producto getProducto() {
		return producto;
	}

	public void setProducto(Producto producto) {
		this.producto = producto;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public Integer getStockInicial() {
		return stockInicial;
	}

	public void setStockInicial(Integer stockInicial) {
		this.stockInicial = stockInicial;
	}
	
	public void calcularStock() {
		if(this.getTipoMovimiento().getTipoMovimiento().equals("ENTRADA") || this.getTipoMovimiento().getTipoMovimiento().equals("ANULACION FACTURA")
				|| this.getTipoMovimiento().getTipoMovimiento().equals("COMPRA")) {

			int tempStock = this.producto.getStock();
			this.setStockInicial(tempStock);
			this.producto.setStock((tempStock + this.getCantidad()));

		} else if(this.getTipoMovimiento().getTipoMovimiento().equals("SALIDA") || this.getTipoMovimiento().getTipoMovimiento().equals("VENTA")){
			int tempStock = this.producto.getStock();
			this.setStockInicial(tempStock);
			this.producto.setStock((tempStock - this.getCantidad()));
		}
	}

	private static final long serialVersionUID = 1L;

}
