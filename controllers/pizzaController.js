const { Pizza } = require('../models');

const getPizzas = async (req, res) => {
  try {
    const pizzas = await Pizza.findAll({ where: { disponible: true } });
    res.json(pizzas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPizzaById = async (req, res) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);
    if (!pizza) return res.status(404).json({ message: 'Pizza non trouvée' });
    res.json(pizza);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPizza = async (req, res) => {
  try {
    const pizza = await Pizza.create(req.body);
    res.status(201).json(pizza);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);
    if (!pizza) return res.status(404).json({ message: 'Pizza non trouvée' });
    await pizza.update(req.body);
    res.json(pizza);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);
    if (!pizza) return res.status(404).json({ message: 'Pizza non trouvée' });
    await pizza.destroy();
    res.json({ message: 'Pizza supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPizzas, getPizzaById, createPizza, updatePizza, deletePizza };