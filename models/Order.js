const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Order', {
    total: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    statut: {
      type: DataTypes.ENUM('en attente', 'en préparation', 'prêt', 'en livraison', 'livré', 'payé', 'annulé', 'en attente paiement'),
      defaultValue: 'en attente'
    },
    modePaiement: {
      type: DataTypes.ENUM('Airtel Money', 'Moov Money', 'Especes'),
      defaultValue: 'Especes'
    },
    modeReception: {
      type: DataTypes.ENUM('livraison', 'retrait'),
      defaultValue: 'livraison'
    },
    adresseLivraison: {
      type: DataTypes.STRING
    },
    localisation: {
      type: DataTypes.TEXT
    },
    qrCode: {
      type: DataTypes.STRING
    },
    codeCommande: {
      type: DataTypes.STRING,
      unique: true
    },
    codeSecret: {
      type: DataTypes.STRING,
      unique: true
    },
    clientId: {
      type: DataTypes.INTEGER
    },
    livreurId: {
      type: DataTypes.INTEGER
    },
    receveurId: {
      type: DataTypes.INTEGER,
      defaultValue: null
    }
  }, {
    tableName: 'orders',
    freezeTableName: true
  });
};