import mongoose from 'mongoose';

const jugadorSchema = new mongoose.Schema({
  nombre: {type: String, required: true},
  edad: {type: Number},
  posicion: {type: String, required: true} ,
  fotoURL: {type: String},
  equipoActual: {type: String, required: true},
 
  // Historial de traspasos
  historialEquipos: [{
    equipo: {type: String},
    partidosJugados: {type: Number},
    puntosPorPartido: {type: Number},
    asistenciasPorPartido: {type: Number},
    rebotesPorPartido: {type: Number},

  // Estadisticas avanzadas
  trueShooting: {type: Number},
  usageRate: {type: Number},
  winShares: {type: Number},
  vorp: {type: Number}
  
  }],
  // Estadisticas por partido
  rebotesPorPartido: {type: Number},
  robosPorPartido: {type: Number},
  taponesPorPartido: {type: Number},
  puntosPorPartido: {type: Number} ,
  asistenciasPorPartido: {type: Number},

  // Estadisticas totales
  partidosJugados: {type: Number},
  partidosEmpezados: {type: Number},
  rebotesTotales: {type: Number},
  taponesTotales: {type: Number},
  puntosTotales: {type: Number},
  robosTotales: {type: Number},
  asistenciasTotales: {type: Number},

  // Estadisticas avanzadas
  trueShooting: {type: Number},
  usageRate: {type: Number},
  winShares: {type: Number},
  vorp: {type: Number}
});

const Jugador = mongoose.model('Jugador', jugadorSchema);

export default Jugador;
