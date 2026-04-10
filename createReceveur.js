const bcrypt = require('bcryptjs');
require('dotenv').config();
const { User } = require('./models');

const createReceveur = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('receveur123', salt);
    await User.create({
      nom: 'Marie Receveur',
      email: 'receveur@bayazoo.com',
      motDePasse: hash,
      role: 'receveur',
      telephone: '+241000002'
    });
    console.log('Receveur cree !');
    console.log('Email : receveur@bayazoo.com');
    console.log('Mot de passe : receveur123');
    process.exit(0);
  } catch (error) {
    console.error('Erreur :', error.message);
    process.exit(1);
  }
};

createReceveur();