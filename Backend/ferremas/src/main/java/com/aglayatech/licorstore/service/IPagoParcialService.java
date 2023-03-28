package com.aglayatech.licorstore.service;

import com.aglayatech.licorstore.model.PagoParcial;

import java.util.List;

public interface IPagoParcialService {

    public List<PagoParcial> findPagosParciales();

    public PagoParcial findPagoParcial(Integer idpago);

    public PagoParcial save(PagoParcial pagoParcial);
}
