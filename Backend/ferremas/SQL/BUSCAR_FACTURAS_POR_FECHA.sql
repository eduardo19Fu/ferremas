CREATE PROCEDURE `PR_VENTAS_POR_FECHA`(IN FECHA_INICIAL DATE, IN FECHA_FINAL DATE)
BEGIN
	DECLARE vFechaInicial DATE;
    DECLARE vFechaFinal DATE;

    BEGIN
		SET vFechaInicial = FECHA_INICIAL;
        SET vFechaFinal = FECHA_FINAL;

        IF vFechaInicial IS NULL OR vFechaFinal IS NULL THEN
            SELECT *
            FROM facturas;
        ELSE
            SELECT *
            FROM facturas f
            WHERE f.fecha BETWEEN DATE(vFechaInicial) AND DATE(vFechaFinal);
        END IF;
    END;
END