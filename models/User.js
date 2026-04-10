const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    motDePasse: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('client', 'admin', 'livreur', 'receveur'),
      defaultValue: 'client'
    },
    telephone: {
      type: DataTypes.STRING
    },
    adresse: {
      type: DataTypes.STRING
    },
  couponUtilise: {
  type: DataTypes.STRING,
  defaultValue: null
  // null = pas encore de coupon genere
  // 'utilise' = coupon utilise, en attente du prochain
}
  });
};