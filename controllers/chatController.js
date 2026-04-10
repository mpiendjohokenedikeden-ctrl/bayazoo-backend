const { Message, Order, sequelize } = require('../models');
const { Op, fn, col } = require('sequelize');

const getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { orderId: req.params.orderId },
      order: [['createdAt', 'ASC']]
    });

    await sequelize.query(
      'UPDATE messages SET lu = 1 WHERE orderId = :orderId AND expediteurId != :userId AND lu = 0',
      { replacements: { orderId: req.params.orderId, userId: req.user.id } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { contenu, orderId } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Commande non trouvee' });
    const message = await Message.create({
      contenu,
      orderId,
      expediteurId: req.user.id,
      expediteurNom: req.user.nom || 'Utilisateur',
      expediteurRole: req.user.role,
      lu: false
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getNonLus = async (req, res) => {
  try {
    const results = await sequelize.query(
      'SELECT orderId, COUNT(id) as count FROM messages WHERE expediteurId != :userId AND lu = 0 GROUP BY orderId',
      {
        replacements: { userId: req.user.id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    const result = {};
    results.forEach(r => {
      result[r.orderId] = parseInt(r.count);
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage, getNonLus };