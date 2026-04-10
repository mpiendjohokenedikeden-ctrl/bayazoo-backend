const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Message', {
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expediteurId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    expediteurNom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expediteurRole: {
      type: DataTypes.STRING,
      allowNull: false
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lu: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
};