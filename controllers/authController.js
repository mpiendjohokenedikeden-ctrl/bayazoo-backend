const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User, Order } = require('../models');

// ===== CONFIGURATION EMAIL =====
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  tls: {
    rejectUnauthorized: false
  },
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Stocker les codes temporairement en mémoire
const codesReinitialisation = {};

const inscription = async (req, res) => {
  try {
    const { nom, email, motDePasse, telephone } = req.body;
    if (!nom || !email || !motDePasse || !telephone) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
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

// ===== ETAPE 1 — Envoyer code par email =====
const envoyerCodeReinit = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email obligatoire' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Aucun compte trouve avec cet email' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    codesReinitialisation[email] = { code, expiration: Date.now() + 10 * 60 * 1000 };

    await transporter.sendMail({
      from: '"BAYAZOO" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Code de reinitialisation BAYAZOO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #f9f9f9; border-radius: 16px;">
          <h1 style="color: #E63946; text-align: center; font-family: Georgia, serif;">BAYAZOO</h1>
          <h2 style="text-align: center; color: #333;">Reinitialisation de mot de passe</h2>
          <p style="color: #666;">Bonjour <strong>${user.nom}</strong>,</p>
          <p style="color: #666;">Voici votre code de reinitialisation :</p>
          <div style="background: #1A1A2E; color: white; font-size: 2.5rem; font-weight: 900; text-align: center; padding: 1.5rem; border-radius: 12px; letter-spacing: 0.5rem; margin: 1.5rem 0;">
            ${code}
          </div>
          <p style="color: #888; font-size: 0.85rem; text-align: center;">Ce code expire dans <strong>10 minutes</strong>.</p>
          <p style="color: #888; font-size: 0.85rem; text-align: center;">Si vous n'avez pas demande cette reinitialisation, ignorez cet email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 1.5rem 0;">
          <p style="color: #bbb; font-size: 0.75rem; text-align: center;">2024 BAYAZOO - La vraie pizza artisanale</p>
        </div>
      `
    });

    res.json({ message: 'Code envoye sur ' + email });
  } catch (error) {
    res.status(500).json({ message: 'Erreur envoi email : ' + error.message });
  }
};

// ===== ETAPE 2 — Verifier code + changer mot de passe =====
const reinitialiserMotDePasse = async (req, res) => {
  try {
    const { email, code, nouveauMotDePasse } = req.body;
    if (!email || !code || !nouveauMotDePasse) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    const donnees = codesReinitialisation[email];
    if (!donnees) return res.status(400).json({ message: 'Aucun code demande pour cet email' });
    if (Date.now() > donnees.expiration) {
      delete codesReinitialisation[email];
      return res.status(400).json({ message: 'Code expire — demandez un nouveau code' });
    }
    if (donnees.code !== code) return res.status(400).json({ message: 'Code incorrect' });
    if (nouveauMotDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit avoir au moins 6 caracteres' });

    const user = await User.findOne({ where: { email } });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(nouveauMotDePasse, salt);
    await user.update({ motDePasse: hash });
    delete codesReinitialisation[email];
    res.json({ message: 'Mot de passe modifie avec succes !' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== MODIFIER NOM =====
const modifierProfil = async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ message: 'Le nom est obligatoire' });
    const user = await User.findByPk(req.user.id);
    await user.update({ nom });
    const token = jwt.sign({ id: user.id, role: user.role, nom }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Profil modifie !', user: { id: user.id, nom, email: user.email, role: user.role }, token });
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
    const livreurs = await User.findAll({ where: { role: 'livreur' }, attributes: ['id', 'nom', 'email', 'telephone', 'createdAt'] });
    res.json(livreurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReceveurs = async (req, res) => {
  try {
    const receveurs = await User.findAll({ where: { role: 'receveur' }, attributes: ['id', 'nom', 'email', 'telephone', 'createdAt'] });
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

const verifierCouponDispo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const SEUIL = 5;
    const nbCommandesPayees = await Order.count({ where: { clientId: req.user.id, statut: 'payé' } });
    const couponsGeneres = Math.floor(nbCommandesPayees / SEUIL);
    const couponsUtilises = parseInt(user.couponUtilise) || 0;
    const aCouponDispo = couponsGeneres > couponsUtilises;
    const commandesDansCycle = nbCommandesPayees % SEUIL;
    const commandesRestantes = aCouponDispo ? 0 : SEUIL - commandesDansCycle;
    res.json({ aCouponDispo, nbCommandesPayees, commandesRestantes, couponsGeneres, couponsUtilises, reduction: 5 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const utiliserCoupon = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const SEUIL = 5;
    const nbCommandesPayees = await Order.count({ where: { clientId: req.user.id, statut: 'payé' } });
    const couponsGeneres = Math.floor(nbCommandesPayees / SEUIL);
    const couponsUtilises = parseInt(user.couponUtilise) || 0;
    if (couponsGeneres <= couponsUtilises) return res.status(400).json({ message: 'Aucun coupon disponible' });
    await user.update({ couponUtilise: String(couponsUtilises + 1) });
    res.json({ message: 'Coupon utilise avec succes', reduction: 5 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifierCoupon = async (req, res) => { return verifierCouponDispo(req, res); };

module.exports = {
  inscription, connexion, creerUtilisateur,
  getLivreurs, getReceveurs, supprimerUtilisateur,
  verifierCoupon, verifierCouponDispo, utiliserCoupon,
  modifierProfil, envoyerCodeReinit, reinitialiserMotDePasse
};