const db = require('./database/connection');

async function quickCheck() {
  try {
    console.log('🔍 Vérification rapide de la base de données...');
    
    // Test de connexion
    await db.query('SELECT 1');
    console.log('✅ Base de données connectée');
    
    // Lister tous les utilisateurs
    const users = await db.query('SELECT email, firstName, lastName, role FROM users');
    console.log(`📋 ${users.length} utilisateur(s) trouvé(s):`);
    
    users.forEach((user, index) => {
      const isYourEmail = user.email === 'mohamedhamed.ibnhadjmohamed@gmail.com';
      const marker = isYourEmail ? '👤' : '   ';
      console.log(`${marker} ${index + 1}. ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`);
    });
    
    if (!users.some(u => u.email === 'mohamedhamed.ibnhadjmohamed@gmail.com')) {
      console.log('\n❌ Votre email n\'est pas dans la base de données!');
      console.log('💡 Solution: Créez votre compte via l\'API d\'inscription');
      
      // Test d'inscription
      console.log('\n🧪 Test d\'inscription...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('Azertyuiop123!', 12);
      
      await db.query(`
        INSERT INTO users (firstName, lastName, email, password, oldmotp, role) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'Mohamed Hamed',
        'Ibn Hadj Mohamed',
        'mohamedhamed.ibnhadjmohamed@gmail.com',
        hashedPassword,
        'Azertyuiop123!',
        'user'
      ]);
      
      console.log('✅ Utilisateur créé avec succès!');
      console.log('📧 Email: mohamedhamed.ibnhadjmohamed@gmail.com');
      console.log('🔑 Password: Azertyuiop123!');
      console.log('🎯 Vous pouvez maintenant vous connecter!');
    } else {
      console.log('\n✅ Votre utilisateur existe dans la base de données!');
      console.log('💡 Le problème vient peut-être du mot de passe');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await db.end();
  }
}

quickCheck();
