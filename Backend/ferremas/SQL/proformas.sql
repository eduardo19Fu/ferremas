-- ============================================================================
-- PROFORMAS (cotizaciones)
--
-- Crea las tablas del modulo de proformas y registra en la factura la proforma que la origino.
-- Una proforma NO mueve inventario: solo cotiza. El inventario se descuenta cuando se convierte en factura.
--
-- Motor: MySQL 8. Ejecutar UNA sola vez (MySQL no soporta "ADD COLUMN IF NOT EXISTS").
-- ============================================================================

CREATE TABLE IF NOT EXISTS proformas (
    id_proforma   BIGINT        NOT NULL AUTO_INCREMENT,
    no_proforma   BIGINT        NULL,                                   -- numero visible; se asigna igual al id al registrar
    total         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fecha_emision TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario    INT           NULL,
    id_estado     INT           NULL,
    id_cliente    INT           NULL,
    PRIMARY KEY (id_proforma),
    UNIQUE KEY uq_proformas_no_proforma (no_proforma),
    KEY idx_proformas_fecha (fecha_emision),
    KEY idx_proformas_usuario (id_usuario),
    KEY idx_proformas_estado (id_estado),
    KEY idx_proformas_cliente (id_cliente),
    CONSTRAINT fk_proformas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_proformas_estado  FOREIGN KEY (id_estado)  REFERENCES estados (id_estado)   ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_proformas_cliente FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS proformas_detalle (
    id_detalle          BIGINT        NOT NULL AUTO_INCREMENT,
    id_proforma         BIGINT        NULL,
    id_producto         INT           NULL,
    cantidad            INT           NOT NULL,
    precio_unitario     DECIMAL(10,2) NULL,
    descuento           FLOAT         NOT NULL DEFAULT 0,
    sub_total           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    sub_total_descuento DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (id_detalle),
    KEY idx_proformas_detalle_proforma (id_proforma),
    KEY idx_proformas_detalle_producto (id_producto),
    CONSTRAINT fk_proformas_detalle_proforma FOREIGN KEY (id_proforma) REFERENCES proformas (id_proforma) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_proformas_detalle_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Proforma que origino cada factura (NULL para las ventas directas).
-- El indice NO es unico: una proforma puede volver a facturarse si su factura anterior fue anulada;
-- el servidor impide dos facturas vigentes de la misma proforma.
ALTER TABLE facturas
    ADD COLUMN id_proforma_origen BIGINT NULL,
    ADD KEY idx_facturas_proforma_origen (id_proforma_origen),
    ADD CONSTRAINT fk_facturas_proforma_origen FOREIGN KEY (id_proforma_origen) REFERENCES proformas (id_proforma) ON DELETE SET NULL ON UPDATE CASCADE;
