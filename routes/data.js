const express = require('express');
const router = express.Router();
const ArduinoData = require('../models/arduinoData'); // Assuming the model is named User


// Route POST pour recevoir les données d'Arduino et les stocker dans la base de données
router.post('/arduino/data', async (req, res) => {
    try {
      // Création d'une nouvelle instance du modèle avec les données reçues
      const newData = new ArduinoData(req.body);
      // Sauvegarde dans la base de données
      await newData.save();
      res.status(201).send('Données enregistrées avec succès');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de l\'enregistrement des données');
    }
  });

  module.exports = router;