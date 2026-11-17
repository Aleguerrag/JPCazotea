# Azotea · Juntos por Colombia

Página de scrollytelling de **Azotea**, la Red de Nodos del Litoral Pacífico de Juntos por Colombia (2027–2030). Cuenta el proyecto, el territorio, el modelo de tres tramos, las metas 2030, la evaluación y la inversión, e incluye el video explicativo de 90 segundos.

## Estructura
```
index.html          Página única
css/main.css        Estilos (paleta y tipografía del sistema visual Azotea)
js/main.js          Scrollytelling, contadores, video, acordeón (sin dependencias)
assets/img          Ilustraciones y logo
assets/video        Video en 1080p y 720p (se elige según pantalla) + póster
assets/fonts        TeX Gyre Bonum (clon libre de Bookman) y Figtree
```

## Ver en local
```bash
python3 -m http.server 8000   # luego abrir http://localhost:8000
```

## Publicación
GitHub Pages desde la rama `main`, carpeta raíz.

## Editar cifras
Todas las cifras están escritas en `index.html`. Los contadores animados leen `data-cuenta`; los escenarios de inversión leen `data-completo` y `data-basico`.

## Fuentes de datos
- Documento integrado JPC 2027 (noviembre de 2026): metas, costeo y diseño de evaluación.
- Universidad Icesi con datos del MEN: cobertura neta en educación media 2023.
- SINEB, MEN: indicadores de Buenaventura 2023.

## Tipografías
- **TeX Gyre Bonum**, GUST Font License (libre, redistribuible). Sustituye a Bookman Old Style, que es de Monotype y no puede publicarse en un repositorio abierto.
- **Figtree**, SIL Open Font License 1.1.
