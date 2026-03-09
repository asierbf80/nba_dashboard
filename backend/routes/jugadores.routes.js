import express from 'express';
import Jugador from '../models/Jugador.js';
import { exec } from 'child_process'; 

const router = express.Router();

// EL ROBOT RECOLECTOR
router.get('/sincronizar', async(req, res) => {
    
    console.log("Llamando al especialista Python...");

    exec('python3 recolector.py', { maxBuffer: 1024 * 1024 * 10 }, async(error, stdout, stderr) => {
        if (error) {
            console.error("El Especialista falló:", error);
            return res.status(500).send('Error ejecutando el script de Python');
        }

        try {
            // 1. Recibimos el PAQUETE DOBLE de Python
            const paquete = JSON.parse(stdout);

            if (paquete.error) {
                console.error("Error desde Python:", paquete.error);
                return res.status(500).send('Error interno en el scraper');
            }

            const normales = paquete.stats_normales;
            const avanzadas = paquete.stats_avanzadas;

            console.log(`¡Datos recibidos! Normales: ${normales.length}, Avanzadas: ${avanzadas.length}`);

            // 2. Diccionario VIP (Avanzadas) - Inteligente por equipos
            const mapaAvanzadas = {};
            avanzadas.forEach(adv => {
                const id = adv.slug;
                if (!mapaAvanzadas[id]) {
                    mapaAvanzadas[id] = { porEquipo: {}, globales: null };
                }

                if (adv.team === 'TOT' || adv.team === 'TOTAL') {
                    mapaAvanzadas[id].globales = adv;
                } else {
                    mapaAvanzadas[id].porEquipo[adv.team] = adv;
                }
            });

            // 3. El Agrupador Definitivo (Normales y creación del Historial)
            const mapaJugadores = {};

            normales.forEach(fila => {
                const id = fila.slug;

                if (!mapaJugadores[id]) {
                    mapaJugadores[id] = {
                        slug: fila.slug,
                        nombre: fila.name,
                        edad: fila.age,
                        posicion: Array.isArray(fila.positions) ? fila.positions[0] : fila.positions,
                        historial: [],     
                        filaTotales: null, 
                        ultimoEquipo: ""   
                    };
                }

                if (fila.team === 'TOT' || fila.team === 'TOTAL') {
                    mapaJugadores[id].filaTotales = fila;
                } else {
                    // Magia: Cruzamos las avanzadas de ESTE equipo concreto
                    const statsAvanzadasDeEsteEquipo = mapaAvanzadas[id]?.porEquipo[fila.team] || {};

                    mapaJugadores[id].historial.push({
                        equipo: fila.team,
                        partidosJugados: fila.games_played,
                        puntosPorPartido: fila.games_played > 0 ? (fila.points / fila.games_played).toFixed(1) : 0,
                        asistenciasPorPartido: fila.games_played > 0 ? (fila.assists / fila.games_played).toFixed(1) : 0,
                        rebotesPorPartido: fila.games_played > 0 ? ((fila.offensive_rebounds + fila.defensive_rebounds) / fila.games_played).toFixed(1) : 0,
                        
                        // Inyectamos las avanzadas en la etapa
                        trueShooting: statsAvanzadasDeEsteEquipo.true_shooting_percentage || 0,
                        usageRate: statsAvanzadasDeEsteEquipo.usage_percentage || 0,
                        winShares: statsAvanzadasDeEsteEquipo.win_shares || 0,
                        vorp: statsAvanzadasDeEsteEquipo.value_over_replacement_player || 0
                    });
                    
                    mapaJugadores[id].ultimoEquipo = fila.team;
                }
            });

            // 4. Mapeo Final para la Base de Datos
            const jugadoresListosParaGuardar = Object.values(mapaJugadores).map(j => {
                const globalesNormales = j.filaTotales || normales.find(n => n.slug === j.slug) || {};
                
                let globalesAvanzadas = mapaAvanzadas[j.slug]?.globales;
                if (!globalesAvanzadas) {
                    const equipos = Object.values(mapaAvanzadas[j.slug]?.porEquipo || {});
                    globalesAvanzadas = equipos[0] || {};
                }

                return {
                    nombre: j.nombre,
                    equipoActual: j.ultimoEquipo, 
                    edad: j.edad,
                    posicion: j.posicion,
                    fotoURL: `https://www.basketball-reference.com/req/202106291/images/headshots/${j.slug}.jpg`,
                    
                    // El array con todas sus etapas
                    historialEquipos: j.historial, 
                    
                    // Estadísticas Totales Globales
                    partidosJugados: globalesNormales.games_played || 0,
                    partidosEmpezados: globalesNormales.games_started || 0,
                    puntosTotales: globalesNormales.points || 0,
                    asistenciasTotales: globalesNormales.assists || 0,
                    rebotesTotales: (globalesNormales.offensive_rebounds || 0) + (globalesNormales.defensive_rebounds || 0),
                    robosTotales: globalesNormales.steals || 0,
                    taponesTotales: globalesNormales.blocks || 0,
                    
                    // Promedios Globales
                    puntosPorPartido: globalesNormales.games_played > 0 ? (globalesNormales.points / globalesNormales.games_played).toFixed(1) : 0,
                    asistenciasPorPartido: globalesNormales.games_played > 0 ? (globalesNormales.assists / globalesNormales.games_played).toFixed(1) : 0,
                    rebotesPorPartido: globalesNormales.games_played > 0 ? (((globalesNormales.offensive_rebounds || 0) + (globalesNormales.defensive_rebounds || 0)) / globalesNormales.games_played).toFixed(1) : 0,
                    robosPorPartido: globalesNormales.games_played > 0 ? (globalesNormales.steals / globalesNormales.games_played).toFixed(1) : 0,
                    taponesPorPartido: globalesNormales.games_played > 0 ? (globalesNormales.blocks / globalesNormales.games_played).toFixed(1) : 0,

                    // Avanzadas Globales
                    trueShooting: globalesAvanzadas.true_shooting_percentage || 0,
                    usageRate: globalesAvanzadas.usage_percentage || 0,
                    winShares: globalesAvanzadas.win_shares || 0,
                    vorp: globalesAvanzadas.value_over_replacement_player || 0
                };
            });

            // 5. Inserción Masiva
            await Jugador.deleteMany({});
            console.log("DB Limpia. Aterrizando nuevos datos cruzados...");
            
            await Jugador.insertMany(jugadoresListosParaGuardar);
            console.log("Los jugadores han aterrizando en París con éxito");

            res.json({
              mensaje: 'Python ejecutado con éxito. Sincronización completada',
              total: jugadoresListosParaGuardar.length,
            });

        } catch (parseError) {
            console.error("Node no pudo entender a Python:", parseError);
            res.status(500).send('Error al traducir los datos');
        }
    });
});

// RUTA POR DEFECTO PARA LEER DATOS
router.get('/', async(req, res) => {
  try {
    var variable = await Jugador.find();
    res.json(variable);
  } catch(error) {
    res.status(500).send('Error');
  }
});

export default router;
