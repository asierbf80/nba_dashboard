const API_URL = 'https://nba-backend-reuc.onrender.com/';
// --- EL DICCIONARIO MAESTRO DE LA NBA ---
const INFO_EQUIPOS = {
    "ATLANTA HAWKS": { conf: "Este", div: "Sureste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png" },
    "BOSTON CELTICS": { conf: "Este", div: "Atlántico", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png" },
    "BROOKLYN NETS": { conf: "Este", div: "Atlántico", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png" },
    "CHARLOTTE HORNETS": { conf: "Este", div: "Sureste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png" },
    "CHICAGO BULLS": { conf: "Este", div: "Central", logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png" },
    "CLEVELAND CAVALIERS": { conf: "Este", div: "Central", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png" },
    "DALLAS MAVERICKS": { conf: "Oeste", div: "Suroeste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png" },
    "DENVER NUGGETS": { conf: "Oeste", div: "Noroeste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/den.png" },
    "DETROIT PISTONS": { conf: "Este", div: "Central", logo: "https://a.espncdn.com/i/teamlogos/nba/500/det.png" },
    "GOLDEN STATE WARRIORS": { conf: "Oeste", div: "Pacífico", logo: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png" },
    "HOUSTON ROCKETS": { conf: "Oeste", div: "Suroeste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png" },
    "INDIANA PACERS": { conf: "Este", div: "Central", logo: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png" },
    "LOS ANGELES CLIPPERS": { conf: "Oeste", div: "Pacífico", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png" },
    "LOS ANGELES LAKERS": { conf: "Oeste", div: "Pacífico", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png" },
    "MEMPHIS GRIZZLIES": { conf: "Oeste", div: "Suroeste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png" },
    "MIAMI HEAT": { conf: "Este", div: "Sureste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png" },
    "MILWAUKEE BUCKS": { conf: "Este", div: "Central", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png" },
    "MINNESOTA TIMBERWOLVES": { conf: "Oeste", div: "Noroeste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/min.png" },
    "NEW ORLEANS PELICANS": { conf: "Oeste", div: "Suroeste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/no.png" },
    "NEW YORK KNICKS": { conf: "Este", div: "Atlántico", logo: "https://a.espncdn.com/i/teamlogos/nba/500/nyk.png" },
    "OKLAHOMA CITY THUNDER": { conf: "Oeste", div: "Noroeste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png" },
    "ORLANDO MAGIC": { conf: "Este", div: "Sureste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png" },
    "PHILADELPHIA 76ERS": { conf: "Este", div: "Atlántico", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png" },
    "PHOENIX SUNS": { conf: "Oeste", div: "Pacífico", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png" },
    "PORTLAND TRAIL BLAZERS": { conf: "Oeste", div: "Noroeste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/por.png" },
    "SACRAMENTO KINGS": { conf: "Oeste", div: "Pacífico", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png" },
    "SAN ANTONIO SPURS": { conf: "Oeste", div: "Suroeste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sas.png" },
    "TORONTO RAPTORS": { conf: "Este", div: "Atlántico", logo: "https://a.espncdn.com/i/teamlogos/nba/500/tor.png" },
    "UTAH JAZZ": { conf: "Oeste", div: "Noroeste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/utah.png" },
    "WASHINGTON WIZARDS": { conf: "Este", div: "Sureste", logo: "https://a.espncdn.com/i/teamlogos/nba/500/was.png" }
};

// --- VARIABLES GLOBALES ---
let todosLosJugadores = [];
const inputBuscador = document.getElementById('buscador');
let temporizadorBuscador;

// --- 1. EL MOTOR DE ARRANQUE ---
async function obtenerJugadores(){
  try{
    const respuesta = await fetch(API_URL);
    todosLosJugadores = await respuesta.json();
    manejarRutas(); // En lugar de pintar todo, encendemos el Router
  } catch(error){
    console.log("Error:", error);
  }
}

// --- 2. EL ENRUTADOR (SPA) ---
function manejarRutas() {
    // Leemos qué hay después del "#" en la barra de direcciones
    const hash = decodeURIComponent(window.location.hash);
    
    // Si estamos en la raíz
    if (hash === '' || hash === '#') {
        inputBuscador.value = ''; // Limpiamos el buscador
        pintarVistaEquipos();
    } 
    // Si hemos hecho clic en un equipo
    else if (hash.startsWith('#equipo/')) {
        const nombreEquipo = hash.replace('#equipo/', '');
        pintarVistaPlantilla(nombreEquipo);
    }
}

// El vigilante de la URL: si cambia el link, cambiamos la pantalla
window.addEventListener('hashchange', manejarRutas);


// --- 3. VISTA 1: INICIO (SOLO EQUIPOS) ---
// --- 3. VISTA 1: INICIO (DIVIDIDO POR CONFERENCIAS Y DIVISIONES) ---
function pintarVistaEquipos() {
    const contenedor = document.getElementById('tablero-jugadores');
    
    // Obtenemos los nombres de los equipos que realmente tenemos en nuestra Base de Datos
    const equiposUnicos = [...new Set(
        todosLosJugadores
            .filter(j => j.equipoActual)
            .map(j => String(j.equipoActual).replace(/_/g, ' '))
    )];

    // Definimos la estructura oficial de la liga
    const estructuraNBA = {
        "Este": ["Atlántico", "Central", "Sureste"],
        "Oeste": ["Noroeste", "Pacífico", "Suroeste"]
    };

    let htmlAcumulado = '';

    // Bucle 1: Recorremos las Conferencias (Este y Oeste)
    for (const [conferencia, divisiones] of Object.entries(estructuraNBA)) {
        
        htmlAcumulado += `
            <div class="bloque-conferencia">
                <h2 class="titulo-conferencia">Conferencia ${conferencia}</h2>
                <div class="divisiones-grid">
        `;

        // Bucle 2: Recorremos las Divisiones dentro de esa Conferencia
        divisiones.forEach(division => {
            htmlAcumulado += `
                <div class="bloque-division">
                    <h3 class="titulo-division">${division}</h3>
                    <div class="equipos-lista">
            `;

            // Bucle 3: Filtramos los equipos de la BBDD que pertenecen a esta división
            const equiposDeEstaDivision = equiposUnicos.filter(eq => 
                INFO_EQUIPOS[eq] && INFO_EQUIPOS[eq].div === division
            );

            equiposDeEstaDivision.forEach(equipo => {
                const info = INFO_EQUIPOS[equipo];
                
                // Generamos la micro-tarjeta con escudo y enlace
                htmlAcumulado += `
                    <a href="#equipo/${equipo}" class="tarjeta-equipo-mini">
                        <img src="${info.logo}" alt="Logo de ${equipo}" class="logo-equipo" loading="lazy">
                        <span>${equipo}</span>
                    </a>
                `;
            });

            htmlAcumulado += `</div></div>`; // Cerramos equipos-lista y bloque-division
        });

        htmlAcumulado += `</div></div>`; // Cerramos divisiones-grid y bloque-conferencia
    }

    contenedor.innerHTML = htmlAcumulado;
}

// --- 4. VISTA 2: PLANTILLA DEL EQUIPO ---
// --- 4. VISTA 2: PLANTILLA DEL EQUIPO ---
function pintarVistaPlantilla(nombreEquipo) {
    const contenedor = document.getElementById('tablero-jugadores');
    
    let plantilla = todosLosJugadores.filter(j => j.equipoActual && String(j.equipoActual).replace(/_/g, ' ') === nombreEquipo);
    plantilla.sort((a, b) => b.puntosPorPartido - a.puntosPorPartido);

    // Fíjate en la estructura: El título va FUERA del div 'grid-jugadores'
    let htmlAcumulado = `
        <div class="cabecera-vista">
            <a href="#" class="btn-volver">⬅ Volver a todos los equipos</a>
            <h2 class="titulo-vista">Plantilla de ${nombreEquipo}</h2>
        </div>
        <div class="grid-jugadores"> `;

    plantilla.forEach(jugador => {
        htmlAcumulado += generarHTMLTarjeta(jugador);
    });

    htmlAcumulado += `</div>`; // Cerramos el grid

    contenedor.innerHTML = htmlAcumulado;
}

// --- 5. VISTA 3: BUSCADOR GLOBAL ---
// --- 5. VISTA 3: BUSCADOR GLOBAL ---
inputBuscador.addEventListener('input', (evento)=>{
    clearTimeout(temporizadorBuscador);

    temporizadorBuscador = setTimeout(()=>{
        const textoEscrito = evento.target.value.toLowerCase();
        
        if (textoEscrito === '') {
            window.location.hash = '#';
            return;
        }

        const jugadoresFiltrados = todosLosJugadores.filter(jugador => {
            return jugador.nombre.toLowerCase().includes(textoEscrito);
        });

        const contenedor = document.getElementById('tablero-jugadores');
        
        // Estructura separada: Título fuera, Grid dentro
        let htmlAcumulado = `
            <div class="cabecera-vista">
                <a href="#" class="btn-volver" onclick="cerrarBuscador(event)">⬅ Cancelar búsqueda</a>
                <h2 class="titulo-vista">Buscando: "${textoEscrito}"</h2>
            </div>
            <div class="grid-jugadores"> `;

        jugadoresFiltrados.forEach(jugador => {
            htmlAcumulado += generarHTMLTarjeta(jugador, textoEscrito);
        });

        htmlAcumulado += `</div>`; // Cerramos el grid

        contenedor.innerHTML = htmlAcumulado;
    }, 300);
});
// --- 6. FABRICA DE TARJETAS (Para no repetir código) ---
function generarHTMLTarjeta(jugador, textoBuscado = '') {
    let nombreMostrado = jugador.nombre;

    if (textoBuscado !== '') {
        const regex = new RegExp(`(${textoBuscado})`, 'gi');
        nombreMostrado = nombreMostrado.replace(regex, '<mark>$1</mark>');
    }

    // 1. LA CAJA PRINCIPAL (Para TODOS, tengan 1 o 10 equipos)
    const tituloCaja = jugador.historialEquipos.length > 1 ? '🔄 HISTORIAL DE TRASPASOS' : '📊 RENDIMIENTO POR PARTIDO';
    
    let htmlHistorial = `
        <div class="caja-stats-principal">
            <h4>${tituloCaja}</h4>
            <div class="etapas-lista">
    `;
    
    // Pintamos las etapas (Si es 1, pinta 1. Si son 2, pinta 2)
    jugador.historialEquipos.forEach((etapa, index) => {
        const tsEtapa = etapa.trueShooting ? (etapa.trueShooting * 100).toFixed(1) + '%' : '-';
        const usgEtapa = etapa.usageRate ? etapa.usageRate + '%' : '-';
        const wsEtapa = etapa.winShares || '0';
        const vorpEtapa = etapa.vorp || '0';
        
        // Solo ponemos el número "1." "2." si hay más de un equipo
        const prefijo = jugador.historialEquipos.length > 1 ? `${index + 1}. ` : '';

        htmlHistorial += `
            <div class="etapa-item">
                <span class="etapa-equipo">${prefijo}${etapa.equipo} <span style="font-size:0.75rem; color:#888;">(${etapa.partidosJugados} PJ)</span></span>
                
                <div class="etapa-stats-grid">
                    <span>🏀 Pts: <strong>${etapa.puntosPorPartido}</strong></span>
                    <span>🤝 Ast: <strong>${etapa.asistenciasPorPartido}</strong></span>
                    <span>🛡️ Reb: <strong>${etapa.rebotesPorPartido}</strong></span>

                    <span class="stat-tooltip" data-tooltip="True Shooting: Eficiencia real (Triples, de 2 y Libres). Promedio: ~58%">🎯 TS: <strong>${tsEtapa}</strong></span>
                    <span class="stat-tooltip" data-tooltip="Usage Rate: % de jugadas que finaliza. Promedio: ~20%">⚙️ USG: <strong>${usgEtapa}</strong></span>
                    <span class="stat-tooltip" data-tooltip="Win Shares: Victorias aportadas. Nivel MVP: > 10">👑 WS: <strong>${wsEtapa}</strong></span>
                    <span class="stat-tooltip" data-tooltip="Value Over Replacement. Promedio: 0">📊 VORP: <strong>${vorpEtapa}</strong></span>


                </div>
            </div>
        `;
    });
    
    htmlHistorial += `</div></div>`; // Cerramos la caja de neón herméticamente

    // 2. FORMATEO GLOBAL
    const tsFormateado = jugador.trueShooting ? (jugador.trueShooting * 100).toFixed(1) + '%' : '-';
    const usgFormateado = jugador.usageRate ? jugador.usageRate + '%' : '-';

    // 3. LA TARJETA FINAL
    return `
        <article class="jugador-card">
            <div class="cabecera-card">
                <h3>${nombreMostrado}</h3>
                <p class="posicion-tag">${jugador.posicion} | ${jugador.equipoActual || 'Sin Equipo'}</p>
            </div>
            
            <img src="${jugador.fotoURL}" alt="Foto de ${jugador.nombre}" loading="lazy">
            
            ${htmlHistorial}
            
            <div class="stats-container">
                <h4>TOTALES DE LA TEMPORADA</h4>
                <div class="stats-grid">
                    <p>👟 PJ: <strong>${jugador.partidosJugados || 0}</strong></p>
                    <p>🔥 Pts: <strong>${jugador.puntosTotales || 0}</strong></p>
                    <p>🧠 Ast: <strong>${jugador.asistenciasTotales || 0}</strong></p>
                    <p>🧱 Reb: <strong>${jugador.rebotesTotales || 0}</strong></p>
                </div>
                     
            </div>
        </article>`;
}


// --- FUNCION PARA ESCAPAR DEL BUSCADOR ---
window.cerrarBuscador = function(evento) {
    evento.preventDefault(); // Evita que la página dé un salto brusco hacia arriba
    const inputBuscador = document.getElementById('buscador');
    inputBuscador.value = ''; // Borramos el texto de la barra
    window.location.hash = ''; // Limpiamos la URL
    pintarVistaEquipos(); // Forzamos el pintado de la pantalla inicial
};


// ¡ENCENDEMOS LOS MOTORES!
obtenerJugadores();
