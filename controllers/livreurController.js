const { Order, User } = require('../models');
const { Op } = require('sequelize');

const getCommandesALivrer = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { livreurId: req.user.id },
      include: [
        { model: User, as: 'client', attributes: ['id', 'nom', 'telephone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFileAttente = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        statut: 'prêt',
        livreurId: null,
        modeReception: 'livraison'
      },
      include: [
        { model: User, as: 'client', attributes: ['id', 'nom', 'telephone'] }
      ],
      order: [['createdAt', 'ASC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const prendreCommande = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvee' });
    if (order.livreurId) return res.status(400).json({ message: 'Commande deja prise par un autre livreur' });
    await order.update({
      livreurId: req.user.id,
      statut: 'en livraison'
    });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const attribuerLivreur = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvee' });
    await order.update({
      livreurId: req.body.livreurId,
      statut: 'en livraison'
    });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getStatsLivreur = async (req, res) => {
  try {
    const aujourd = new Date();
    aujourd.setHours(0, 0, 0, 0);

    const toutesCommandes = await Order.findAll({
      where: { livreurId: req.user.id }
    });

    const commandesAujourdhui = toutesCommandes.filter(c =>
      new Date(c.createdAt) >= aujourd
    );

    const revenuAujourdhui = commandesAujourdhui
      .filter(c => c.statut === 'payé' || c.statut === 'livré')
      .reduce((sum, c) => sum + parseFloat(c.total), 0);

    res.json({
      total: toutesCommandes.length,
      aujourd: commandesAujourdhui.length,
      terminees: toutesCommandes.filter(c => ['livré', 'payé'].includes(c.statut)).length,
      enCours: toutesCommandes.filter(c => c.statut === 'en livraison').length,
      revenuAujourdhui
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCommandesALivrer, getFileAttente, prendreCommande, attribuerLivreur, getStatsLivreur };