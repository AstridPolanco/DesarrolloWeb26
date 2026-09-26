import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export const Curso = sequelize.define('curso', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: { msg: 'El nombre es obligatorio' } },
  },

  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { notEmpty: { msg: 'El nombre es obligatorio' } },
  }
  creditos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {min:{arg: [1], msg: 'Los creditos deben ser mayores a 0'}}
  },
}, {
  tableName: 'cursos',
});