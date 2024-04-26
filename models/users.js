const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schéma pour les utilisateurs
const userSchema = new Schema({
    FullName:{ type: String, required: true ,minlength: 3}, 
    email:{ type: String, required: true, unique: true},
    password:{ type: String, required: true ,minlength: 8}, 
    CarId:{ type: String,required: true}
})

// Modèle pour les utilisateurs
const user = mongoose.model("user", userSchema);

module.exports = user ;
