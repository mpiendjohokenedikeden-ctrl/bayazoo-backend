const { RemiseEspeces, Order, User } = require('../models');

const demanderRemise = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const livreurId = req.user.id;

    const commandes = await Order.findAll({
      where: {
        livreurId,
        statut: { [Op.in]: ['payé', 'livré'] },
        modeReception: 'livraison'
      }
    });
    const commandesEspeces = commandes.filter(c =>
      (c.modePaiement || '').toLowerCase().includes('espece')
    );
    const totalEspeces = commandesEspeces.reduce((sum, c) => sum + parseFloat(c.total), 0);

    const remisesConfirmees = await RemiseEspeces.findAll({
      where: { livreurId, statut: 'confirme' }
    });
    const totalRemis = remisesConfirmees.reduce((sum, r) => sum + parseFloat(r.montant), 0);
    const solde = totalEspeces - totalRemis;

    if (solde <= 0) return res.status(400).json({ message: 'Aucun solde especes a remettre' });

    const enAttente = await RemiseEspeces.findOne({ where: { livreurId, statut: 'en_attente' } });
    if (enAttente) return res.status(400).json({ message: 'Une demande de remise est deja en attente' });

    const remise = await RemiseEspeces.create({ livreurId, montant: solde });
    res.status(201).json({ message: 'Demande de remise envoyee !', remise });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmerRemise = async (req, res) => {
  try {
    const remise = await RemiseEspeces.findByPk(req.params.id, {
      include: [{ model: User, as: 'livreur', attributes: ['id', 'nom'] }]
    });
    if (!remise) return res.status(404).json({ message: 'Remise non trouvee' });
    if (remise.statut === 'confirme') return res.status(400).json({ message: 'Deja confirme' });
    await remise.update({ statut: 'confirme', confirmeParId: req.user.id });
    res.json({ message: 'Remise confirmee !', remise });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSolde = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const livreurId = req.user.id;

    const commandes = await Order.findAll({
      where: {
        livreurId,
        statut: { [Op.in]: ['payé', 'livré'] },
        modeReception: 'livraison'
      }
    });
    const commandesEspeces = commandes.filter(c =>
      (c.modePaiement || '').toLowerCase().includes('espece')
    );
    const totalEspeces = commandesEspeces.reduce((sum, c) => sum + parseFloat(c.total), 0);

    const remisesConfirmees = await RemiseEspeces.findAll({
      where: { livreurId, statut: 'confirme' }
    });
    const totalRemis = remisesConfirmees.reduce((sum, r) => sum + parseFloat(r.montant), 0);

    const enAttente = await RemiseEspeces.findOne({ where: { livreurId, statut: 'en_attente' } });

    res.json({
      solde: Math.max(0, totalEspeces - totalRemis),
      totalEspeces,
      totalRemis,
      remiseEnAttente: enAttente || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSoldeLivreur = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const livreurId = req.params.livreurId;

    const commandes = await Order.findAll({
      where: {
        livreurId,
        statut: { [Op.in]: ['payé', 'livré'] },
        modeReception: 'livraison'
      }
    });
    const commandesEspeces = commandes.filter(c =>
      (c.modePaiement || '').toLowerCase().includes('espece')
    );
    const totalEspeces = commandesEspeces.reduce((sum, c) => sum + parseFloat(c.total), 0);

    const remisesConfirmees = await RemiseEspeces.findAll({
      where: { livreurId, statut: 'confirme' }
    });
    const totalRemis = remisesConfirmees.reduce((sum, r) => sum + parseFloat(r.montant), 0);

    const enAttente = await RemiseEspeces.findOne({ where: { livreurId, statut: 'en_attente' } });

    res.json({
      solde: Math.max(0, totalEspeces - totalRemis),
      totalEspeces,
      totalRemis,
      remiseEnAttente: enAttente || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRemisesEnAttente = async (req, res) => {
  try {
    const remises = await RemiseEspeces.findAll({
      where: { statut: 'en_attente' },
      include: [{ model: User, as: 'livreur', attributes: ['id', 'nom', 'telephone'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json(remises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistoriqueRemises = async (req, res) => {
  try {
    const remises = await RemiseEspeces.findAll({
      where: { livreurId: req.params.livreurId },
      order: [['createdAt', 'DESC']]
    });
    res.json(remises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { demanderRemise, confirmerRemise, getSolde, getSoldeLivreur, getRemisesEnAttente, getHistoriqueRemises };