package com.aglayatech.licorstore.service.impl;

import com.aglayatech.licorstore.model.PagoParcial;
import com.aglayatech.licorstore.repository.IPagoParcialRepository;
import com.aglayatech.licorstore.service.IPagoParcialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PagoParcialServiceImpl implements IPagoParcialService {

    @Autowired
    private IPagoParcialRepository repository;

    @Override
    public List<PagoParcial> findPagosParciales() {
        return repository.findAll();
    }

    @Override
    public PagoParcial findPagoParcial(Integer idpago) {
        return repository.findById(idpago).orElse(null);
    }

    @Override
    public PagoParcial save(PagoParcial pagoParcial) {
        return repository.save(pagoParcial);
    }
}
