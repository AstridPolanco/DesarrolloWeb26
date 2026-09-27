import { ICursosRepository } from './ICursosRepository.js';

export class SequelizeCursosRepository extends ICursosRepository {
    constructor(modelo) { super(); this.modelo = modelo; }
    async listar() { return this.modelo.findAll({ order: [['nombre', 'ASC']] }); }
    async obtener(id) { return this.modelo.findByPk(id); }
    async crear(datos) { return this.modelo.create(datos); }
}