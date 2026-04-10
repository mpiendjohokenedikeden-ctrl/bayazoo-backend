const bcrypt = require('bcryptjs');
require('dotenv').config();
const { User } = require('./models');

const createLivreur = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('livreur123', salt);

    await User.create({
      nom: 'Jean Livreur',
      email: 'livreur@bayazoo.com',
      motDePasse: hash,
      role: 'livreur',
      telephone: '+241000001'
    });

    console.log('✅ Livreur créé avec succès !');
    console.log('📧 Email : livreur@bayazoo.com');
    console.log('🔑 Mot de passe : livreur123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    process.exit(1);
  }
};

createLivreur();