const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Pizza', {
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prix: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: '🍕'
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'pizzas',
    freezeTableName: true
  });
};