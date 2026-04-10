const express = require('express');
const router = express.Router();
const livreurController = require('../controllers/livreurController');
const protect = require('../middleware/authMiddleware');

router.get('/commandes', protect, livreurController.getCommandesALivrer);
router.get('/file-attente', protect, livreurController.getFileAttente);
router.get('/stats', protect, livreurController.getStatsLivreur);
router.put('/:id/prendre', protect, livreurController.prendreCommande);
router.put('/:id/attribuer', protect, livreurController.attribuerLivreur);

module.exports = router;