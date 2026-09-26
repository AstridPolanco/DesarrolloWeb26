import {ICursosRepository} from './ICursosRepository.js';

export class SequelizeCursosRepository
  extends ICursosRepository {

  constructor(modelo) { super(); this.modelo = modelo; }

  async listar() {
    return this.modelo.findAll({ order: [['nombre', 'ASC']] });
  }
  async obtener(id) { return this.modelo.findByPk(id); }
  async crear(datos) { return this.modelo.create(datos); }
  async actualizar(id, cambios) {
    const [filas] = await this.modelo.update(cambios, { where: { id } });
    return filas ? this.obtener(id) : null;
  }
  async eliminar(id) { return this.modelo.destroy({ where: { id } }); }
}