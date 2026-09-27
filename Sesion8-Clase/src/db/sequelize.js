import { Sequelize } from 'sequelize';
import { config } from '../config.js';

export const sequelize = new Sequelize(config.db, {
    logging: false,
    define: { underscored: true, timestamps: true },
});

export async function conectar() {
    await sequelize.authenticate();
    console.log('Sequelize conectado');
    await sequelize.sync();
}