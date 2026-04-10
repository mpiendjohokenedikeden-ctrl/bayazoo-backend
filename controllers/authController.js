const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Order } = require('../models');

const inscription = async (req, res) => {
  try {
    const { nom, email, motDePasse, telephone } = req.body;
    const userExiste = await User.findOne({ where: { email } });
    if (userExiste) return res.status(400).json({ message: 'Cet email est deja utilise' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(motDePasse, salt);
    const user = await User.create({ nom, email, motDePasse: hash, telephone });
    const token = jwt.sign({ id: user.id, role: user.role, nom: user.nom }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    const valide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valide) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    const token = jwt.sign({ id: user.id, role: user.role, nom: user.nom }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const creerUtilisateur = async (req, res) => {
  try {
    const { nom, email, motDePasse, telephone, role } = req.body;
    const roles = ['livreur', 'receveur'];
    if (!roles.includes(role)) return res.status(400).json({ message: 'Role invalide' });
    const userExiste = await User.findOne({ where: { email } });
    if (userExiste) return res.status(400).json({ message: 'Cet email est deja utilise' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(motDePasse, salt);
    const user = await User.create({ nom, email, motDePasse: hash, telephone, role });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLivreurs = async (req, res) => {
  try {
    const livreurs = await User.findAll({
      where: { role: 'livreur' },
      attributes: ['id', 'nom', 'email', 'telephone', 'createdAt']
    });
    res.json(livreurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReceveurs = async (req, res) => {
  try {
    const receveurs = await User.findAll({
      where: { role: 'receveur' },
      attributes: ['id', 'nom', 'email', 'telephone', 'createdAt']
    });
    res.json(receveurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const supprimerUtilisateur = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouve' });
    await user.destroy();
    res.json({ message: 'Utilisateur supprime' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== VERIFIER SI LE CLIENT A UN COUPON DISPONIBLE =====
const verifierCouponDispo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const SEUIL = 5;

    // Compter toutes les commandes payees du client
    const nbCommandesPayees = await Order.count({
      where: { clientId: req.user.id, statut: 'payé' }
    });

    // Nombre de coupons generes au total (1 tous les 5 commandes)
    const couponsGeneres = Math.floor(nbCommandesPayees / SEUIL);

    // Nombre de coupons utilises (stocke en base comme un nombre)
    const couponsUtilises = parseInt(user.couponUtilise) || 0;

    // Le client a un coupon dispo si il a genere plus de coupons qu'il n'en a utilises
    const aCouponDispo = couponsGeneres > couponsUtilises;

    // Commandes dans le cycle actuel
    const commandesDansCycle = nbCommandesPayees % SEUIL;
    const commandesRestantes = aCouponDispo ? 0 : SEUIL - commandesDansCycle;

    res.json({
      aCouponDispo,
      nbCommandesPayees,
      commandesRestantes,
      couponsGeneres,
      couponsUtilises,
      reduction: 5
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== UTILISER LE COUPON =====
const utiliserCoupon = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const SEUIL = 5;

    const nbCommandesPayees = await Order.count({
      where: { clientId: req.user.id, statut: 'payé' }
    });

    const couponsGeneres = Math.floor(nbCommandesPayees / SEUIL);
    const couponsUtilises = parseInt(user.couponUtilise) || 0;

    if (couponsGeneres <= couponsUtilises) {
      return res.status(400).json({ message: 'Aucun coupon disponible' });
    }

    // Incrementer le nombre de coupons utilises
    await user.update({ couponUtilise: String(couponsUtilises + 1) });

    res.json({ message: 'Coupon utilise avec succes', reduction: 5 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifierCoupon = async (req, res) => {
  return verifierCouponDispo(req, res);
};

module.exports = {
  inscription, connexion, creerUtilisateur,
  getLivreurs, getReceveurs, supprimerUtilisateur,
  verifierCoupon, verifierCouponDispo, utiliserCoupon
};