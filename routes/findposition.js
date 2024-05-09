const express = require('express');
const router = express.Router();
const Position = require('../models/position'); // Assuming the model is named User



// Route pour ajouter une nouvelle position
router.post("/positions", async (req, res) => {
    try {
      const { carId, location } = req.body;
      const newPosition = new Position({ carId, location });
      await newPosition.save();
      res.status(201).json(newPosition);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });


// Route pour obtenir la position actuelle d'un véhicule par son ID
router.get("/positions/:carId", async (req, res) => {
    try {
      const carId = req.params.carId;
      const currentPosition = await Position.findOne({ carId }).sort({ timestamp: -1 });
      if (currentPosition) {
        res.json(currentPosition);
      } else {
        res.status(404).json({ message: "Position not found" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


  // Route API pour récupérer l'historique des positions d'un véhicule pour les dernières 24 heures
router.get("/history/:carId", async (req, res) => {
  const { carId } = req.params;

  try {
    // Récupérer les positions des 3 derniers jours pour le véhicule donné
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const positions = await Position.find({ carId, timestamp: { $gte: threeDaysAgo } }).sort({ timestamp: 1 });

    res.json(positions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique des positions.' });
  }
});


  module.exports = router;