const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Order', {
    total: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    statut: {
      type: DataTypes.ENUM('en attente', 'en préparation', 'en livraison', 'livré', 'payé', 'annulé'),
      defaultValue: 'en attente'
    },
    modePaiement: {
      type: DataTypes.ENUM('airtel', 'moov', 'mtn', 'especes'),
      defaultValue: 'especes'
    },
    modeReception: {
      type: DataTypes.ENUM('livraison', 'retrait'),
      defaultValue: 'livraison'
    },
    adresseLivraison: {
      type: DataTypes.STRING
    },
    qrCode: {
      type: DataTypes.STRING
    },
    codeCommande: {
      type: DataTypes.STRING,
      unique: true
    },
    clientId: {
      type: DataTypes.INTEGER
    },
    livreurId: {
      type: DataTypes.INTEGER
    }
  });
};