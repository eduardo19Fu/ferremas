package com.aglayatech.licorstore.generics;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.data.domain.Sort;

/**
 * Convierte el parametro {@code sort=campo,dir} de los listados paginados en un {@link Sort} seguro.
 *
 * <p>Solo se aceptan columnas de una lista blanca (clave publica -> ruta JPA), para no permitir
 * ordenar por campos internos (p. ej. contrasenas) ni provocar errores con propiedades inexistentes.
 * Si el parametro falta o no es valido se usa el orden por defecto del listado.</p>
 */
public final class SortParam {

	private SortParam() {
	}

	/** Lista blanca en la que la clave publica coincide con la ruta JPA. */
	public static Map<String, String> keys(String... keys) {
		Map<String, String> map = new LinkedHashMap<>();
		for (String key : keys) {
			map.put(key, key);
		}
		return map;
	}

	/**
	 * @param sort       valor recibido, p. ej. {@code "nombre,desc"} (la direccion es opcional)
	 * @param allowed    clave publica -> ruta JPA permitida
	 * @param fallback   orden por defecto
	 * @param tieBreaker propiedad unica que se agrega al final para que la paginacion sea estable
	 */
	public static Sort parse(String sort, Map<String, String> allowed, Sort fallback, String tieBreaker) {
		if (sort == null || sort.isBlank()) {
			return fallback;
		}
		String[] parts = sort.split(",");
		String path = allowed.get(parts[0].trim());
		if (path == null) {
			return fallback;
		}
		Sort.Direction direction = parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())
				? Sort.Direction.DESC
				: Sort.Direction.ASC;
		Sort order = Sort.by(direction, path);
		return path.equals(tieBreaker) ? order : order.and(Sort.by(Sort.Direction.DESC, tieBreaker));
	}
}
