package com.aglayatech.licorstore.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "productos")
public class Producto implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer idProducto;
	@NotNull(message = "Código de Producto no puede estar vacío.")
	private String codProducto;
	private String nombre;
	private Double precioCompra;
	private Double precioVenta;
	private float porcentajeGanancia;
	private Double segundoPrecio;
	private String imagen;
	private String descripcion;
	private String link;

	@Temporal(TemporalType.DATE)
	private Date fechaVencimiento;

	@Temporal(TemporalType.DATE)
	private Date fechaIngreso;

	@Temporal(TemporalType.TIMESTAMP)
	private Date fechaRegistro;

	private int stock;

	@NotNull(message = "Marca no puede estar vacío.")
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_marca_producto")
	@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
	private MarcaProducto marcaProducto;

	@NotNull(message = "Tipo no puede estar vacío.")
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_tipo_producto")
	@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
	private TipoProducto tipoProducto;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_estado")
	@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
	private Estado estado;

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "producto")
	@JsonIgnoreProperties({ "producto", "hibernateLazyInitializer", "handler" })
	private List<MovimientoProducto> movimientos;

	public Producto() {
		this.movimientos = new ArrayList<>();
	}

	@PrePersist
	public void configFechaRegistro() {
		this.fechaRegistro = new Date();
	}

	public Integer getIdProducto() {
		return idProducto;
	}

	public void setIdProducto(Integer idProducto) {
		this.idProducto = idProducto;
	}

	public String getCodProducto() {
		return codProducto;
	}

	public void setCodProducto(String codProducto) {
		this.codProducto = codProducto;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public Double getPrecioCompra() {
		return precioCompra;
	}

	public void setPrecioCompra(Double precioCompra) {
		this.precioCompra = precioCompra;
	}

	public Double getPrecioVenta() {
		return precioVenta;
	}

	public void setPrecioVenta(Double precioVenta) {
		this.precioVenta = precioVenta;
	}

	public float getPorcentajeGanancia() {
		return porcentajeGanancia;
	}

	public void setPorcentajeGanancia(float porcentajeGanancia) {
		this.porcentajeGanancia = porcentajeGanancia;
	}

	public Double getSegundoPrecio() {
		return segundoPrecio;
	}

	public void setSegundoPrecio(Double segundoPrecio) {
		this.segundoPrecio = segundoPrecio;
	}

	public Date getFechaVencimiento() {
		return fechaVencimiento;
	}

	public void setFechaVencimiento(Date fechaVencimiento) {
		this.fechaVencimiento = fechaVencimiento;
	}

	public int getStock() {
		return stock;
	}

	public void setStock(int stock) {
		this.stock = stock;
	}

	public MarcaProducto getMarcaProducto() {
		return marcaProducto;
	}

	public void setMarcaProducto(MarcaProducto marcaProducto) {
		this.marcaProducto = marcaProducto;
	}

	public TipoProducto getTipoProducto() {
		return tipoProducto;
	}

	public void setTipoProducto(TipoProducto tipoProducto) {
		this.tipoProducto = tipoProducto;
	}

	public Estado getEstado() {
		return estado;
	}

	public void setEstado(Estado estado) {
		this.estado = estado;
	}

	public String getImagen() {
		return imagen;
	}

	public void setImagen(String imagen) {
		this.imagen = imagen;
	}

	public Date getFechaIngreso() {
		return fechaIngreso;
	}

	public void setFechaIngreso(Date fechaIngreso) {
		this.fechaIngreso = fechaIngreso;
	}

	public Date getFechaRegistro() {
		return fechaRegistro;
	}

	public void setFechaRegistro(Date fechaRegistro) {
		this.fechaRegistro = fechaRegistro;
	}

	public List<MovimientoProducto> getMovimientos() {
		return movimientos;
	}

	public void setMovimientos(List<MovimientoProducto> movimientos) {
		this.movimientos = movimientos;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public String getLink() {
		return link;
	}

	public void setLink(String link) {
		this.link = link;
	}

	@Override
	public String toString() {
		final StringBuilder sb = new StringBuilder("Producto{");
		sb.append("idProducto=").append(idProducto);
		sb.append(", codProducto='").append(codProducto).append('\'');
		sb.append(", nombre='").append(nombre).append('\'');
		sb.append(", precioCompra=").append(precioCompra);
		sb.append(", precioVenta=").append(precioVenta);
		sb.append(", porcentajeGanancia=").append(porcentajeGanancia);
		sb.append(", segundoPrecio=").append(segundoPrecio);
		sb.append(", imagen='").append(imagen).append('\'');
		sb.append(", descripcion='").append(descripcion).append('\'');
		sb.append(", link='").append(link).append('\'');
		sb.append(", fechaVencimiento=").append(fechaVencimiento);
		sb.append(", fechaIngreso=").append(fechaIngreso);
		sb.append(", fechaRegistro=").append(fechaRegistro);
		sb.append(", stock=").append(stock);
		sb.append(", marcaProducto=").append(marcaProducto);
		sb.append(", tipoProducto=").append(tipoProducto);
		sb.append(", estado=").append(estado);
		sb.append(", movimientos=").append(movimientos);
		sb.append('}');
		return sb.toString();
	}

	private static final long serialVersionUID = 1L;

}
