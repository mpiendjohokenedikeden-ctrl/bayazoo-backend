const bcrypt = require('bcryptjs');
require('dotenv').config();
const { User } = require('./models');

const createAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);

    await User.create({
      nom: 'Admin BAYAZOO',
      email: 'admin@bayazoo.com',
      motDePasse: hash,
      role: 'admin',
      telephone: '+241000000'
    });

    console.log('✅ Admin créé avec succès !');
    console.log('📧 Email : admin@bayazoo.com');
    console.log('🔑 Mot de passe : admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    process.exit(1);
  }
};

createAdmin();