package com.aglayatech.licorstore.service;

import com.aglayatech.licorstore.model.Pais;

import java.util.List;

public interface IPaisService {

    public List<Pais> getAll();

    public Pais getPais(Integer idpais);

    public Pais save(Pais pais);

    public void delete(Integer idpais);

	public org.springframework.data.domain.Page<Pais> search(String termino, org.springframework.data.domain.Pageable pageable);
}
