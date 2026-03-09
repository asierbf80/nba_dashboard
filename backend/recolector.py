import json
from basketball_reference_web_scraper import client

# 1. El Traductor de Objetos Complejos (Enums)
def traductor_json(objeto):
    # Si el objeto tiene un "value" (como Position.POINT_GUARD o Team.LOS_ANGELES_LAKERS)
    if hasattr(objeto, 'value'):
        return objeto.value
    # Si es cualquier otra cosa rara, lo forzamos a texto normal
    return str(objeto)

try:
    # 2. Pedimos los datos de la temporada 2023-2024
    normales = client.players_season_totals(season_end_year=2026)
    avanzadas = client.players_advanced_season_totals(season_end_year=2026)
    
    paquete_completo = {
        "stats_normales": normales,
        "stats_avanzadas": avanzadas
    }
    # 3. MÁGIA: Le pasamos nuestro traductor al conversor de JSON
    print(json.dumps(paquete_completo, default=traductor_json))

except Exception as e:
    print(json.dumps({"error": str(e)}))
