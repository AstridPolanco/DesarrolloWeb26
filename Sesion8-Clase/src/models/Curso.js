import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export const Curso = sequelize.define('curso', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    codigo: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { notEmpty: true } },
    creditos: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
}, { tableName: 'cursos' });