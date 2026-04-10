const express = require('express');
const router = express.Router();
const { demanderRemise, confirmerRemise, getSolde, getSoldeLivreur, getRemisesEnAttente, getHistoriqueRemises } = require('../controllers/remiseController');
const protect = require('../middleware/authMiddleware');

router.get('/solde', protect, getSolde);
router.get('/solde-livreur/:livreurId', protect, getSoldeLivreur);
router.post('/demander', protect, demanderRemise);
router.put('/:id/confirmer', protect, confirmerRemise);
router.get('/en-attente', protect, getRemisesEnAttente);
router.get('/historique/:livreurId', protect, getHistoriqueRemises);

module.exports = router;