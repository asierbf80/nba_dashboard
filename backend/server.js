import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import rutasJugadores from './routes/jugadores.routes.js';
import cors from 'cors';

const app = express();
app.use(cors()); // Al usarlo ahora sin subir la web a producción puede entrar to kiski, cuando lo subamos, pasaremos opciones para que 
// sólo deje entrar al dominio oficial.
const PORT = 3000;
const urlBaseDatos = process.env.MONGO_URI;

app.get("/", (req, res) => {
  res.send("Hola Mundo");
});

mongoose.connect(urlBaseDatos).then(() => {
  console.log("Conectado a la bóveda de la NBA en París.")
}).catch((error) => {
  console.error(error);
});

app.use('/api/jugadores', rutasJugadores);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

