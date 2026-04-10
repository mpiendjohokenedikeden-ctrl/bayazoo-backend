const { Order, User, OrderItem, sequelize } = require('../models');

const genererCode = () => 'BZ' + Math.floor(1000 + Math.random() * 9000);
const genererCodeSecret = () => 'PAY-' + Math.random().toString(36).substring(2, 8).toUpperCase();

const createOrder = async (req, res) => {
  try {
    const { total, modePaiement, modeReception, adresseLivraison, localisation, items } = req.body;
    const order = await Order.create({
      total, modePaiement, modeReception, adresseLivraison,
      localisation: localisation ? JSON.stringify(localisation) : null,
      clientId: req.user.id,
      codeCommande: genererCode(),
      codeSecret: genererCodeSecret(),
      statut: 'en attente'
    });
    if (items && items.length > 0) {
      await Promise.all(items.map(item =>
        OrderItem.create({
          orderId: order.id,
          pizzaId: item.id || null,
          nom: item.nom,
          prix: item.prix,
          quantite: item.quantite
        })
      ));
    }
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMesCommandes = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { clientId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await sequelize.query(
      `SELECT o.*, 
        c.nom as clientNom, c.email as clientEmail, c.telephone as clientTel,
        l.nom as livreurNom, l.telephone as livreurTel
       FROM orders o
       LEFT JOIN users c ON o.clientId = c.id
       LEFT JOIN users l ON o.livreurId = l.id
       ORDER BY o.createdAt DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const ordersWithItems = await Promise.all(orders.map(async o => {
      const items = await OrderItem.findAll({ where: { orderId: o.id } });
      return {
        ...o,
        livreurId: o.livreurId,
        client: o.clientNom ? { id: o.clientId, nom: o.clientNom, email: o.clientEmail, telephone: o.clientTel } : null,
        livreur: o.livreurNom ? { id: o.livreurId, nom: o.livreurNom, telephone: o.livreurTel } : null,
        items
      };
    }));
    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatut = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvee' });

    const { role, id: userId } = req.user;
    const { statut } = req.body;

    if (role === 'receveur') {
      const statutsAutorises = ['en préparation', 'prêt', 'payé'];
      if (!statutsAutorises.includes(statut)) {
        return res.status(403).json({ message: 'Statut non autorise' });
      }
      if (statut === 'en préparation') {
        if (order.receveurId && parseInt(order.receveurId) !== parseInt(userId)) {
          return res.status(403).json({ message: 'Cette commande est deja prise par un autre receveur' });
        }
        await order.update({ statut, receveurId: userId });
        return res.json(order);
      }
      if (order.receveurId && parseInt(order.receveurId) !== parseInt(userId)) {
        return res.status(403).json({ message: 'Vous ne gerez pas cette commande' });
      }
      if (statut === 'prêt') {
        const mp = (order.modePaiement || '').toLowerCase();
        const estEspeces = mp.includes('espece');
        const estRetrait = order.modeReception === 'retrait';
        if (estRetrait && estEspeces) {
          await order.update({ statut: 'en attente paiement' });
        } else {
          await order.update({ statut: 'prêt' });
        }
        return res.json(order);
      }
      if (statut === 'payé') {
        const mp = (order.modePaiement || '').toLowerCase();
        if (mp.includes('espece')) {
          return res.status(403).json({ message: 'Ce paiement doit etre valide par la caisse' });
        }
        await order.update({ statut: 'payé' });
        return res.json(order);
      }
    }

    if (role === 'admin') {
      if (statut === 'payé' && order.statut === 'en attente paiement') {
        await order.update({ statut: 'payé' });
        return res.json(order);
      }
      return res.status(403).json({ message: 'Admin ne peut modifier que les paiements en attente' });
    }

    if (role === 'livreur') {
      if (!['livré', 'payé'].includes(statut)) {
        return res.status(403).json({ message: 'Statut non autorise' });
      }
    }

    await order.update({ statut });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvee' });
    await OrderItem.destroy({ where: { orderId: req.params.id } });
    await order.destroy();
    res.json({ message: 'Commande supprimee' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validerPaiement = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const livreurId = req.user?.id;
    const role = req.user?.role;

    const order = await Order.findOne({
      where: {
        [Op.or]: [
          { codeSecret: req.params.code },
          { codeCommande: req.params.code }
        ]
      }
    });

    if (!order) return res.status(404).json({ message: 'Code invalide — commande introuvable' });
    if (order.statut === 'payé') return res.status(400).json({ message: 'Commande deja payee' });
    if (order.statut === 'livré') return res.status(400).json({ message: 'Commande deja livree' });

    if (role === 'livreur') {
      if (!order.livreurId || parseInt(order.livreurId) !== parseInt(livreurId)) {
        return res.status(403).json({ message: 'Cette commande ne vous est pas assignee' });
      }
    }

    await order.update({ statut: 'payé' });
    const orderMiseAJour = await Order.findByPk(order.id);
    res.json({ message: 'Paiement valide !', order: orderMiseAJour });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validerPaiementEspeces = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvee' });
    if (order.statut !== 'en attente paiement') {
      return res.status(400).json({ message: 'Cette commande n\'est pas en attente de paiement' });
    }
    await order.update({ statut: 'payé' });
    res.json({ message: 'Paiement valide !', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMesCommandes, getAllOrders, updateStatut, deleteOrder, validerPaiement, validerPaiementEspeces };