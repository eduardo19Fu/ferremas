package com.aglayatech.licorstore.generics;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Exporta un listado completo (todas las paginas que coinciden con el filtro) a un archivo .xlsx.
 *
 * Usa escritura en streaming (SXSSF): solo mantiene unas filas en memoria, asi que sirve para listados grandes.
 * Cada exportacion define sus columnas con {@link #columna}; el resto (estilos, filtros, congelado de cabecera) es comun.
 */
public final class ExcelExporter {

	public static final String CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

	/** Tamano de pagina con el que se recorre la consulta. */
	private static final int LOTE = 500;

	/** Limite de filas de una hoja de Excel (menos la cabecera). */
	private static final int MAX_FILAS = 1_048_575;

	public enum Tipo { TEXTO, ENTERO, DECIMAL, MONEDA, FECHA, FECHA_HORA }

	public static final class Columna<T> {
		final String titulo;
		final int ancho;
		final Tipo tipo;
		final Function<T, Object> valor;

		Columna(String titulo, int ancho, Tipo tipo, Function<T, Object> valor) {
			this.titulo = titulo;
			this.ancho = ancho;
			this.tipo = tipo;
			this.valor = valor;
		}
	}

	private ExcelExporter() {
	}

	/** Respuesta HTTP con el archivo adjunto; el nombre lleva la fecha y hora de la exportacion. */
	public static org.springframework.http.ResponseEntity<byte[]> respuesta(String prefijo, byte[] datos) {
		String marca = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmm"));
		String nombre = prefijo + "_" + marca + ".xlsx";
		return org.springframework.http.ResponseEntity.ok()
				.header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombre + "\"")
				.contentType(org.springframework.http.MediaType.parseMediaType(CONTENT_TYPE))
				.body(datos);
	}

	/** Define una columna: titulo, ancho aproximado (en caracteres), tipo de dato y como obtener el valor. */
	public static <T> Columna<T> columna(String titulo, int ancho, Tipo tipo, Function<T, Object> valor) {
		return new Columna<>(titulo, ancho, tipo, valor);
	}

	/**
	 * Genera el archivo.
	 *
	 * @param hoja     nombre de la hoja
	 * @param columnas columnas a escribir
	 * @param orden    orden de la consulta (el mismo del listado en pantalla)
	 * @param consulta funcion que, dada una pagina, devuelve esa pagina de resultados
	 */
	public static <T> byte[] exportar(String hoja, List<Columna<T>> columnas, Sort orden,
			Function<Pageable, Page<T>> consulta) throws IOException {

		SXSSFWorkbook libro = new SXSSFWorkbook(100);
		try {
			SXSSFSheet hojaXls = libro.createSheet(hoja);
			Estilos estilos = new Estilos(libro);

			// cabecera
			Row cabecera = hojaXls.createRow(0);
			cabecera.setHeightInPoints(22);
			for (int c = 0; c < columnas.size(); c++) {
				Cell celda = cabecera.createCell(c);
				celda.setCellValue(columnas.get(c).titulo);
				celda.setCellStyle(estilos.cabecera);
				hojaXls.setColumnWidth(c, Math.min(columnas.get(c).ancho, 100) * 256);
			}
			hojaXls.createFreezePane(0, 1);

			// filas, pagina por pagina
			int fila = 1;
			int pagina = 0;
			Page<T> actual;
			do {
				actual = consulta.apply(PageRequest.of(pagina++, LOTE, orden));
				for (T elemento : actual.getContent()) {
					if (fila > MAX_FILAS) {
						break;
					}
					Row fil = hojaXls.createRow(fila++);
					for (int c = 0; c < columnas.size(); c++) {
						escribir(fil.createCell(c), columnas.get(c), columnas.get(c).valor.apply(elemento), estilos);
					}
				}
			} while (actual.hasNext() && fila <= MAX_FILAS);

			hojaXls.setAutoFilter(new CellRangeAddress(0, Math.max(fila - 1, 0), 0, columnas.size() - 1));

			ByteArrayOutputStream salida = new ByteArrayOutputStream();
			libro.write(salida);
			return salida.toByteArray();
		} finally {
			libro.dispose();
			libro.close();
		}
	}

	private static <T> void escribir(Cell celda, Columna<T> columna, Object valor, Estilos estilos) {
		celda.setCellStyle(estilos.para(columna.tipo));
		if (valor == null) {
			return;
		}
		if (valor instanceof Number) {
			celda.setCellValue(((Number) valor).doubleValue());
		} else if (valor instanceof Date) {
			celda.setCellValue((Date) valor);
		} else if (valor instanceof LocalDate) {
			celda.setCellValue(java.sql.Date.valueOf((LocalDate) valor));
		} else if (valor instanceof LocalDateTime) {
			celda.setCellValue(Date.from(((LocalDateTime) valor).atZone(ZoneId.systemDefault()).toInstant()));
		} else {
			celda.setCellValue(textoSeguro(valor.toString()));
		}
	}

	/** Evita que Excel interprete como formula un texto que empieza con =, +, - o @ (inyeccion de formulas). */
	private static String textoSeguro(String texto) {
		if (!texto.isEmpty() && "=+-@".indexOf(texto.charAt(0)) >= 0) {
			return "'" + texto;
		}
		return texto;
	}

	/** Estilos de celda reutilizables (Excel limita su cantidad por libro). */
	private static final class Estilos {
		final CellStyle cabecera;
		private final List<CellStyle> porTipo = new ArrayList<>();

		Estilos(SXSSFWorkbook libro) {
			DataFormat formato = libro.createDataFormat();

			XSSFCellStyle encabezado = (XSSFCellStyle) libro.createCellStyle();
			encabezado.setFillForegroundColor(new XSSFColor(new byte[] { 0x10, 0x30, 0x3d }, null));
			encabezado.setFillPattern(FillPatternType.SOLID_FOREGROUND);
			encabezado.setAlignment(HorizontalAlignment.LEFT);
			encabezado.setVerticalAlignment(VerticalAlignment.CENTER);
			Font negrita = libro.createFont();
			negrita.setBold(true);
			negrita.setColor(IndexedColors.WHITE.getIndex());
			encabezado.setFont(negrita);
			this.cabecera = encabezado;

			for (Tipo tipo : Tipo.values()) {
				CellStyle estilo = libro.createCellStyle();
				estilo.setVerticalAlignment(VerticalAlignment.CENTER);
				estilo.setBorderBottom(BorderStyle.HAIR);
				estilo.setBottomBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
				switch (tipo) {
				case ENTERO:
					estilo.setDataFormat(formato.getFormat("#,##0"));
					break;
				case DECIMAL:
					estilo.setDataFormat(formato.getFormat("#,##0.00"));
					break;
				case MONEDA:
					estilo.setDataFormat(formato.getFormat("\"Q\"#,##0.00"));
					break;
				case FECHA:
					estilo.setDataFormat(formato.getFormat("dd/mm/yyyy"));
					estilo.setAlignment(HorizontalAlignment.CENTER);
					break;
				case FECHA_HORA:
					estilo.setDataFormat(formato.getFormat("dd/mm/yyyy hh:mm"));
					estilo.setAlignment(HorizontalAlignment.CENTER);
					break;
				default:
					break;
				}
				porTipo.add(estilo);
			}
		}

		CellStyle para(Tipo tipo) {
			return porTipo.get(tipo.ordinal());
		}
	}
}
