const { Horaire } = require('../models');

const getHoraires = async (req, res) => {
  try {
    const horaires = await Horaire.findAll({
      order: [['id', 'ASC']]
    });
    res.json(horaires);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateHoraire = async (req, res) => {
  try {
    const { heureOuverture, heureFermeture, ouvert } = req.body;
    const horaire = await Horaire.findByPk(req.params.id);
    if (!horaire) return res.status(404).json({ message: 'Horaire non trouve' });
    await horaire.update({ heureOuverture, heureFermeture, ouvert });
    res.json(horaire);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const isOuvert = async (req, res) => {
  try {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const maintenant = new Date();
    const jourActuel = jours[maintenant.getDay()];
    const heureActuelle = maintenant.getHours().toString().padStart(2, '0') + ':' + maintenant.getMinutes().toString().padStart(2, '0');

    const horaire = await Horaire.findOne({ where: { jour: jourActuel } });

    if (!horaire || !horaire.ouvert) {
      return res.json({ ouvert: false, message: 'Nous sommes fermes aujourd\'hui', horaire });
    }

    if (heureActuelle < horaire.heureOuverture || heureActuelle > horaire.heureFermeture) {
      return res.json({
        ouvert: false,
        message: 'Nous sommes fermes pour le moment. Ouverture a ' + horaire.heureOuverture,
        horaire
      });
    }

    res.json({ ouvert: true, message: 'Nous sommes ouverts !', horaire });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getHoraires, updateHoraire, isOuvert };