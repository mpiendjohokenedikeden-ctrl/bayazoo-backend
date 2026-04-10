const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getHoraires, updateHoraire, isOuvert } = require('../controllers/horaireController');

router.get('/', getHoraires);
router.get('/status', isOuvert);
router.put('/:id', protect, updateHoraire);

module.exports = router;