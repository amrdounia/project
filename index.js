const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');



mongoose
.connect("mongodb://dounia:WIbk1tRMThUMfsh7@ac-7vpgwp6-shard-00-00.6cejj7c.mongodb.net:27017,ac-7vpgwp6-shard-00-01.6cejj7c.mongodb.net:27017,ac-7vpgwp6-shard-00-02.6cejj7c.mongodb.net:27017/?ssl=true&replicaSet=atlas-z51zbx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0")
 .then(()=>{
    console.log("Connected successfully")
})
.catch((error)=>{
    console.log("Error when connecting:",error)
})



const app = express();


app.use(express.json());

// Utilisation des routes
app.use('/api/auth', authRoutes);

// Utilisation des routes
app.use('/api/data', dataRoutes);


app.listen(3000, () => {
  console.log(`Serveur lancé sur le port 3000`);
});
