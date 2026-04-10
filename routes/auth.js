const express = require('express');
const router = express.Router();
const { inscription, connexion, creerUtilisateur, getLivreurs, getReceveurs, supprimerUtilisateur, verifierCoupon, verifierCouponDispo, utiliserCoupon } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/inscription', inscription);
router.post('/connexion', connexion);
router.get('/profil', protect, async (req, res) => {
  const { User } = require('../models');
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'nom', 'email', 'role', 'telephone', 'couponUtilise']
  });
  res.json(user);
});
router.post('/creer-livreur', protect, (req, res, next) => { req.body.role = 'livreur'; next(); }, creerUtilisateur);
router.post('/creer-receveur', protect, (req, res, next) => { req.body.role = 'receveur'; next(); }, creerUtilisateur);
router.get('/livreurs', protect, getLivreurs);
router.get('/receveurs', protect, getReceveurs);
router.delete('/utilisateurs/:id', protect, supprimerUtilisateur);
router.post('/verifier-coupon', protect, verifierCoupon);
router.post('/utiliser-coupon', protect, utiliserCoupon);
router.get('/coupon-dispo', protect, verifierCouponDispo);

module.exports = router;