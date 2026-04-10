const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT),
    logging: false
  }
);

const User = require('./User')(sequelize);
const Pizza = require('./Pizza')(sequelize);
const Order = require('./Order')(sequelize);
const Livreur = require('./Livreur')(sequelize);
const Message = require('./Message')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Horaire = require('./Horaire')(sequelize);
const RemiseEspeces = require('./RemiseEspeces')(sequelize);

// Associations
User.hasMany(Order, { foreignKey: 'clientId', as: 'commandes' });
Order.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
User.hasMany(Order, { foreignKey: 'livreurId', as: 'livraisons' });
Order.belongsTo(User, { foreignKey: 'livreurId', as: 'livreur' });
Order.hasMany(Message, { foreignKey: 'orderId' });
Message.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
User.hasMany(Order, { foreignKey: 'receveurId', as: 'receptionsReceveur' });
Order.belongsTo(User, { foreignKey: 'receveurId', as: 'receveur_user' });
User.hasMany(RemiseEspeces, { foreignKey: 'livreurId', as: 'remises' });
RemiseEspeces.belongsTo(User, { foreignKey: 'livreurId', as: 'livreur' });

const syncDB = async () => {
  await sequelize.sync({ alter: false });
  console.log('✅ Tables synchronisees !');
};

syncDB();

module.exports = { sequelize, User, Pizza, Order, Livreur, Message, OrderItem, Horaire, RemiseEspeces };