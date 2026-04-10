const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connecté avec succès !');
    await sequelize.sync({ alter: true });
    console.log('✅ Tables créées/mises à jour !');
  } catch (error) {
    console.error('❌ Erreur MySQL :', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };