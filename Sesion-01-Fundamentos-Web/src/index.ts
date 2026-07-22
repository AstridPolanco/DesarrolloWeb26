/**
 * HTTP Inspector CLI
 *
 * Tarea de la Sesión 1: Fundamentos de la Web
 *
 * Esta tarea NO usa la red, ni async/await, ni librerías externas.
 * Solo la biblioteca estándar de Node + tipos básicos de TypeScript.
 *
 * Idea: aplicar lo que aprendiste sobre HTTP (URLs, métodos, códigos
 * de estado y cabeceras) implementando pequeñas funciones puras.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Resultado de analizar una URL. */
export interface UrlParts {
  /** Protocolo tal como lo devuelve la WHATWG URL, p. ej. "https:". */
  protocol: string;
  /** Host (puede incluir puerto), p. ej. "api.ejemplo.com:443". */
  host: string;
  /** Ruta, p. ej. "/users". */
  pathname: string;
  /** Query string con el "?" inicial, p. ej. "?id=1&name=Ana". */
  search: string;
  /** Lista de pares [clave, valor] de los query params. */
  query: Array<[string, string]>;
}

/** Categoría de un código de estado HTTP. */
export type StatusCategory =
  | "1xx Informativo"
  | "2xx Éxito"
  | "3xx Redirección"
  | "4xx Error del cliente"
  | "5xx Error del servidor"
  | "Desconocido";

/** Mapa de cabeceras HTTP. */
export type Headers = Record<string, string>;

// ---------------------------------------------------------------------------
// Funciones a implementar
// ---------------------------------------------------------------------------

/**
 * Analiza una URL y devuelve sus partes.
 *
 * @param url - URL completa analizar
 * @returns objecto que contiene protocolo, host, path, query params
 * @throws si la URL es válida
 * 
 * @example
 * ```ts
 * parseUrl("https://api.ejemplo.com/users?id=1")
 * //-> {protocol: "https:", host: "api.ejemplo.com", ...}
 * ```
 */
export function parseUrl(url: string): UrlParts {
  const u:URL = new URL(url)

    return{
      protocol: u.protocol,
      host: u.host,
      pathname: u.pathname,
      search: u.search,
      query: Array.from(u.searchParams.entries())
    }

}

/**
 * Clasifica un código de estado HTTP en su categoría (1xx-5xx).
 * @param code - Código de estado HTTP, como: 404
 * @returns Categoria textual que le corresponde o "Desconocido" si no está en el rango
 */
export function classifyStatus(code: number): StatusCategory {
  if (code >= 100 && code <= 199)
  {
    return "1xx Informativo";
  }
    else if (code >= 200 && code <= 299)
    {
      return "2xx Éxito";
    }
    else if (code >= 300 && code <= 399)
    {
      return "3xx Redirección";
    }
    else if (code >= 400 && code <= 499)
    {
      return "4xx Error del cliente";
    }
    else if (code >= 500 && code <= 599)
    {
      return "5xx Error del servidor";
    }
    else
    {
      return "Desconocido";
    }
}

/**
 * Parsea un texto con líneas Nombre: valor a un objeto de cabeceras
 * 
 * @param text - Texto con una cabecera por linea
 * @returns Objeto donde cada una de las claves es el nombre de la cabecera y su contenido es el valor
 */
export function parseHeaders(text: string): Headers {

  const headers: Headers = {};
  const lines = text.split("\n");

  for (const line of lines)
  {
    const trimmedLine = line.trim();
    if (trimmedLine == "") continue;

    const separator = trimmedLine.indexOf(":");
    if (separator === -1) continue;

    const name = trimmedLine.slice(0, separator).trim();
    const value = trimmedLine.slice(separator + 1).trim();

    headers[name] = value;
  }

return headers;
}

/**
 * Combina las funciones anteriores: análisis de URL, código de estado y cabeceras, en un resumen legible.
 *
 * @param url - URL de la peticion
 * @param status - Código de estado HTTP
 * @param headersText - Texto crudo de las cabeceras
 * @returns Resumen en texto plano de la petición
 */
export function summarizeRequest(
  url: string,
  status: number,
  headersText: string,
): string {

  const {host, pathname} = parseUrl(url);
  const category = classifyStatus(status);
  const headers = parseHeaders(headersText);

  const headerLines = Object.entries(headers)
    .map(([name, value]) => ` ${name}: ${value}`)
    .join("\n");

  return [
      "Petición",
      `URL: ${url}`,
      `Host: ${host}`,
      `Path: ${pathname}`,
      `Status: ${status} (${category})`,
      "Headers: ",
      headerLines || "(ninguna)",
    ].join("\n");
}

// ---------------------------------------------------------------------------
// CLI (opcional, pero recomendado para probar manualmente)
// ---------------------------------------------------------------------------

if (require.main === module) {
  const [, , cmd, ...args] = process.argv;
  try {
    if (cmd === "parse-url" && args[0]) {
      const parts = parseUrl(args[0]);
      console.log(JSON.stringify(parts, null, 2));
    } else if (cmd === "status" && args[0]) {
      const cat = classifyStatus(Number(args[0]));
      console.log(cat);
    } else if (cmd === "headers" && args.length > 0) {
      const h = parseHeaders(args.join(" "));
      console.log(JSON.stringify(h, null, 2));
    } else if (cmd === "summary" && args.length >= 2) {
      const [url, status, ...rest] = args;
      console.log(summarizeRequest(url, Number(status), rest.join(" ")));
    } else {
      console.log("Uso:");
      console.log('  npm start parse-url "https://ejemplo.com/path?a=1"');
      console.log("  npm start status 404");
      console.log('  npm start headers "Content-Type: application/json"');
      console.log('  npm start summary "https://x.com" 200 "Content-Type: application/json"');
    }
  } catch (e) {
    console.error("Error:", (e as Error).message);
    process.exit(1);
  }
}
