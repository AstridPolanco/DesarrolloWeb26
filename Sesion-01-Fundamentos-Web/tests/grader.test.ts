/**
 * Tests de calificación — Sesión 1: HTTP Inspector CLI
 *
 * Para correrlos:
 *   npm install
 *   npm test
 *
 * Cada test verifica un requisito de la tarea. Si TODOS pasan,
 * la implementación cumple con los objetivos de la sesión.
 */

import * as fs from "fs";
import * as path from "path";
import {
  parseUrl,
  classifyStatus,
  parseHeaders,
  summarizeRequest,
} from "../src/index";

describe("Tarea Sesion 1: HTTP Inspector CLI", () => {

  // -------------------------------------------------------------------------
  // parseUrl
  // -------------------------------------------------------------------------
  describe("parseUrl(url)", () => {
    it("extrae protocolo, host, path y query params", () => {
      const r = parseUrl("https://api.ejemplo.com/users?id=1&name=Ana");
      expect(r.protocol).toBe("https:");
      expect(r.host).toBe("api.ejemplo.com");
      expect(r.pathname).toBe("/users");
      expect(r.search).toBe("?id=1&name=Ana");
      expect(r.query).toEqual(
        expect.arrayContaining([
          ["id", "1"],
          ["name", "Ana"],
        ]),
      );
      expect(r.query).toHaveLength(2);
    });

    it("funciona con URLs sin query params", () => {
      const r = parseUrl("http://localhost:3000/health");
      expect(r.protocol).toBe("http:");
      expect(r.host).toBe("localhost:3000");
      expect(r.pathname).toBe("/health");
      expect(r.search).toBe("");
      expect(r.query).toEqual([]);
    });

    it("lanza Error con una URL invalida", () => {
      expect(() => parseUrl("esto no es una url")).toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // classifyStatus
  // -------------------------------------------------------------------------
  describe("classifyStatus(code)", () => {
    it.each<[number, string]>([
      [100, "1xx Informativo"],
      [199, "1xx Informativo"],
      [200, "2xx Éxito"],
      [201, "2xx Éxito"],
      [299, "2xx Éxito"],
      [301, "3xx Redirección"],
      [399, "3xx Redirección"],
      [400, "4xx Error del cliente"],
      [404, "4xx Error del cliente"],
      [499, "4xx Error del cliente"],
      [500, "5xx Error del servidor"],
      [599, "5xx Error del servidor"],
      [42, "Desconocido"],
      [600, "Desconocido"],
      [-1, "Desconocido"],
    ])("codigo %i → '%s'", (code, expected) => {
      expect(classifyStatus(code)).toBe(expected);
    });
  });

  // -------------------------------------------------------------------------
  // parseHeaders
  // -------------------------------------------------------------------------
  describe("parseHeaders(text)", () => {
    it("parsea varias lineas en un Record", () => {
      const text =
        "Content-Type: application/json\nAuthorization: Bearer abc";
      const h = parseHeaders(text);
      expect(h["Content-Type"]).toBe("application/json");
      expect(h["Authorization"]).toBe("Bearer abc");
    });

    it("ignora lineas vacias", () => {
      const h = parseHeaders("A: 1\n\nB: 2");
      expect(h["A"]).toBe("1");
      expect(h["B"]).toBe("2");
    });

    it("ignora lineas sin ':'", () => {
      const h = parseHeaders(
        "Content-Type: application/json\nlinea invalida sin dos puntos",
      );
      expect(h["Content-Type"]).toBe("application/json");
      expect(h["linea invalida sin dos puntos"]).toBeUndefined();
    });

    it("recorta espacios alrededor del nombre y del valor", () => {
      const h = parseHeaders("   X-Token  :   abc123   ");
      expect(h["X-Token"]).toBe("abc123");
    });
  });

  // -------------------------------------------------------------------------
  // summarizeRequest
  // -------------------------------------------------------------------------
  describe("summarizeRequest(url, status, headersText)", () => {
    it("devuelve un string no vacio", () => {
      const s = summarizeRequest(
        "https://api.x.com/users",
        200,
        "Content-Type: application/json",
      );
      expect(typeof s).toBe("string");
      expect(s.trim().length).toBeGreaterThan(0);
    });

    it("incluye la URL y el codigo de estado en el resumen", () => {
      const s = summarizeRequest(
        "https://api.x.com/users",
        404,
        "Content-Type: application/json",
      );
      expect(s).toMatch(/api\.x\.com/);
      expect(s).toMatch(/404/);
    });
  });

  // -------------------------------------------------------------------------
  // Calidad de codigo
  // -------------------------------------------------------------------------
  describe("Calidad del codigo", () => {
    it("no debe usar 'any' en el codigo fuente", () => {
      const src = fs.readFileSync(
        path.join(__dirname, "../src/index.ts"),
        "utf-8",
      );
      // Quitamos comentarios y strings para no penalizar menciones en docs
      const sinComentarios = src
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");
      const sinStrings = sinComentarios.replace(
        /(['"`])(?:\\.|(?!\1).)*\1/g,
        '""',
      );
      const matches = sinStrings.match(/\bany\b/g) || [];
      expect(matches.length).toBe(0);
    });
  });
});
