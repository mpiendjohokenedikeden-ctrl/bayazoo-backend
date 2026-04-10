const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, orderController.createOrder);
router.get('/mes-commandes', protect, orderController.getMesCommandes);
router.get('/', protect, orderController.getAllOrders);
router.put('/:id/statut', protect, orderController.updateStatut);
router.delete('/:id', protect, orderController.deleteOrder);
router.get('/valider/:code', protect, orderController.validerPaiement);
router.put('/:id/valider-especes', protect, orderController.validerPaiementEspeces);

module.exports = router;