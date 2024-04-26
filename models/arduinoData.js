const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const arduinoDataSchema = new Schema({
    time: String,
    date: String,
    satellites: Number,
    location: {
      type: { type: String },
      coordinates: []
    },
    googleMapsLocation: String,
    speed: Number,
    heading: Number,
    altitude: Number
  });
  
  // Création d'un modèle MongoDB basé sur le schéma
  const ArduinoData = mongoose.model('ArduinoData', arduinoDataSchema);

  module.exports = ArduinoData ;