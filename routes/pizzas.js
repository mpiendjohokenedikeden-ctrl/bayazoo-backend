const express = require('express');
const router = express.Router();
const { getPizzas, getPizzaById, createPizza, updatePizza, deletePizza } = require('../controllers/pizzaController');

router.get('/', getPizzas);
router.get('/:id', getPizzaById);
router.post('/', createPizza);
router.put('/:id', updatePizza);
router.delete('/:id', deletePizza);

module.exports = router;