/**
 * Procesador de logs y sistema de inventario — Tarea Sesión 6
 * Universidad Mariano Gálvez de Guatemala · Desarrollo Web
 *
 * Implementa las funciones marcadas con TODO para que los tests pasen.
 * No cambies los nombres exportados ni su firma.
 *
 * Temas de la sesión aplicados aquí:
 *   - ES Modules avanzado (named/default exports, re-exports)  → ./src/index.js
 *   - __dirname/__filename con import.meta.url                 → este archivo
 *   - Streams y pipelines (Transform para filtrar)             → filtrarLogs
 *   - Testing con node:test (unitario + integración)           → tests/
 *   - better-sqlite3 (CRUD, transacciones)                     → ./src/db.js
 */
import { createReadStream, createWriteStream, link } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable, Transform } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { resolve } from 'node:dns';
import { rejects } from 'node:assert';
import { error } from 'node:console';

// __dirname y __filename reproducidos con import.meta.url (ES Modules)
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// =====================================================
// Utilidades (ya implementadas — no las modifiques)
// =====================================================

/**
 * Crea un id único.
 * @returns {string}
 */
export function generarId() {
    return `r-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

/**
 * Componentes y módulos.
 *
 * TODO 1: crea un módulo `src/math.js` (named exports) con:
 *   - const PI = 3.14159
 *   - function sumar(a, b)
 *   - function restar(a, b)
 *
 * TODO 2: crea un módulo `src/logger.js` (default export) con:
 *   - default function registrarProceso(msg) → string con formato
 *     `[fecha ISO] msg` (solo devuelve el string, no lo imprime)
 *
 * TODO 3: en `src/index.js` re-exporta (barrel exports) todo lo anterior:
 *   export { PI, sumar, restar } from "./math.js";
 *   export { default as logger } from "./logger.js";
 *   export { ... } from "./app.js";   // las funciones públicas
 *
 * Cuando termines, corre el test "Estructura de módulos"
 * para verificar que los re-exports funcionan.
 */

/**
 * Filtra las líneas de un archivo de log que contienen un texto y
 * escribe el resultado en otro archivo, usando Streams + pipeline.
 *
 * IMPORTANTE: usa `import { createReadStream, createWriteStream } from 'node:fs'`
 * y `pipeline` de 'node:stream/promises' (ya importados arriba).
 *
 * @param {string} origen  - Ruta del archivo de entrada.
 * @param {string} destino - Ruta del archivo de salida.
 * @param {string} texto   - Texto que deben contener las líneas.
 * @returns {Promise<number>} cantidad de líneas que coincidieron (0 si no hay).
 */
export async function filtrarLogs(origen, destino, texto) {
    let contador = 0;
    let sobra = '';

    const transformador = new Transform( {
        transform(chunk, encoding, callback) {
            sobra += chunk.toString();
            const lineas = sobra.split('\n');
            sobra = lineas.pop();

            let salida = '';
            for (const linea of lineas) {
                if (linea.includes(texto)) {
                    salida += linea + '\n';
                    contador++;
                }
            }

            callback(null, salida);
        },
        flush(callback) {
            if (sobra.includes(texto)) {
                contador++;
                callback(null, sobra + '\n');
            } else {
                callback();
            }
        },
    });

    await pipeline(
        createReadStream(origen, 'utf-8'),
        transformador,
        createWriteStream(destino)
    );
    return contador;
}

/**
 * Lee un archivo de texto y devuelve las líneas como arreglo,
 * sin líneas vacías. NO uses readFile: debes usar un Readable + recolección
 * (puedes leer con `createReadStream` y acumular por chunks).
 *
 * @param {string} ruta
 * @returns {Promise<string[]>}
 */
export async function leerLineas(ruta) {
    return new Promise((resolve, reject) => {
        const stream = createReadStream(ruta, 'utf-8');
        let contenido = '';

        stream.on('data', (chunk) => {
            contenido += chunk;
        });

        stream.on('end', () => {
            const lineas = contenido.split('\n').map((linea) => linea.trim()).filter((linea) => linea !== '');
            resolve(lineas);
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Devuelve una ruta absoluta a partir de una ruta relativa al proyecto.
 * Usa el __dirname que definimos arriba + join.
 *
 * @param {string} rutaRelativa
 * @returns {string}
 */
export function rutaAbsoluta(rutaRelativa) {
    return join(__dirname, rutaRelativa);
}

/**
 * Parsea el contenido de un archivo de configuración ".env" (simple).
 * Formato por línea: CLAVE=VALOR  (ignora líneas vacías y las que empiezan con #).
 * Devuelve un objeto con las claves en mayúsculas.
 *
 * @param {string} contenido
 * @returns {Record<string, string>}
 */
export function parsearEnv(contenido) {
    const resultado = {};
    const lineas = contenido.split('\n');

    for (const linea of lineas) {
        const lineaLimpia = linea.trim();

        if (lineaLimpia === '' || lineaLimpia.startsWith('#')) {
            continue;
        }

        const indiceIgual = lineaLimpia.indexOf('=');
        if (indiceIgual === -1) {
            continue;
        }

        const clave = lineaLimpia.slice(0, indiceIgual).trim().toUpperCase();
        const valor = lineaLimpia.slice(indiceIgual + 1).trim();

        resultado[clave] = valor;
    }

    return resultado;
}