const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schéma pour les positions des véhicules
const positionSchema = new Schema({
    carId: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  });
  
  const Position = mongoose.model("Position", positionSchema);

  module.exports = Position;
