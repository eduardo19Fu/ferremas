package com.aglayatech.licorstore.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "clientes")
public class Cliente implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer idCliente;
	private String nombre;
	private String nit;
	private String identificacion;
	private String direccion;
	private String telefono;

	@Temporal(TemporalType.TIMESTAMP)
	private Date fechaRegistro;

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "cliente")
	@JsonIgnoreProperties({ "cliente", "hibernateLazyInitializer", "handler" })
	private List<Factura> facturas;

	public Cliente() {
		facturas = new ArrayList<>();
	}

	@PrePersist
	public void configFechaRegistro() {
		fechaRegistro = new Date();
	}

	public Integer getIdCliente() {
		return idCliente;
	}

	public void setIdCliente(Integer idCliente) {
		this.idCliente = idCliente;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getNit() {
		return nit;
	}

	public void setNit(String nit) {
		this.nit = nit;
	}

	public String getIdentificacion() {
		return identificacion;
	}

	public void setIdentificacion(String identificacion) {
		this.identificacion = identificacion;
	}

	public String getDireccion() {
		return direccion;
	}

	public void setDireccion(String direccion) {
		this.direccion = direccion;
	}

	public Date getFechaRegistro() {
		return fechaRegistro;
	}

	public void setFechaRegistro(Date fechaRegistro) {
		this.fechaRegistro = fechaRegistro;
	}

	public String getTelefono() {
		return telefono;
	}

	public void setTelefono(String telefono) {
		this.telefono = telefono;
	}

	@Override
	public String toString() {
		final StringBuilder sb = new StringBuilder("Cliente{");
		sb.append("idCliente=").append(idCliente);
		sb.append(", nombre='").append(nombre).append('\'');
		sb.append(", nit='").append(nit).append('\'');
		sb.append(", identificacion='").append(identificacion).append('\'');
		sb.append(", direccion='").append(direccion).append('\'');
		sb.append(", telefono='").append(telefono).append('\'');
		sb.append(", fechaRegistro=").append(fechaRegistro);
		sb.append(", facturas=").append(facturas);
		sb.append('}');
		return sb.toString();
	}

	private static final long serialVersionUID = 1L;

}
