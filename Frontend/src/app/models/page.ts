/** Respuesta paginada de Spring Data (Page<T>). */
export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // pagina actual (base 0)
    size: number;
    first: boolean;
    last: boolean;
}
