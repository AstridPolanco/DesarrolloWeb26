import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export const Usuario = sequelize.define('usuario', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'usuarios' });