// plugin
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

//inscription
exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10) // hachage bcrypt du mot de passe
    .then(hash => {
	  //utilisation de buffer et base64 pour masquer l'adresse mail dans la BDD
	  let buff = new Buffer.from(req.body.email);
	  let emailBase64 = buff.toString('base64');
	  
	  //Enregistrement nouvel utilisateur :
      const user = new User({
        email: emailBase64,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// connexion 
exports.login = (req, res, next) => {
	let buff = new Buffer.from(req.body.email);
	let emailBase64 = buff.toString('base64');
	
	
	User.findOne({ email: emailBase64 }) // on retrouve le user avec l'adresse mail
		.then(user => {
		  if (!user) {
			return res.status(401).json({ error: 'Utilisateur non trouvé !' });
		  }
	  
	   //Comparaison du password envoyé avec celui de la bdd :
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({userId: user._id,token: jwt.sign( { userId: user._id },'RANDOM_TOKEN_SECRET',{ expiresIn: '24h' }) }); // mise en place du token
        
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};