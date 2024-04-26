const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schéma pour les positions des véhicules
const positionSchema = new Schema({
    carId: { type: String, required: true },
    location: {
        type: { type: String },
        coordinates: []
      },
    timestamp: { type: Date, default: Date.now }
  });
  
  const Position = mongoose.model("Position", positionSchema);

  module.exports = Position;
