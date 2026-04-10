const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('RemiseEspeces', {
    livreurId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    montant: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    statut: {
      type: DataTypes.ENUM('en_attente', 'confirme'),
      defaultValue: 'en_attente'
    },
    confirmeParId: {
      type: DataTypes.INTEGER,
      defaultValue: null
    }
  }, {
    tableName: 'remiseespeces',
    freezeTableName: true
  });
};