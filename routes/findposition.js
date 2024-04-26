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

  module.exports = router;