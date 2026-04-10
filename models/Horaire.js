const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Horaire', {
    jour: {
      type: DataTypes.STRING,
      allowNull: false
    },
    heureOuverture: {
      type: DataTypes.STRING,
      defaultValue: '09:00'
    },
    heureFermeture: {
      type: DataTypes.STRING,
      defaultValue: '22:00'
    },
    ouvert: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });
};