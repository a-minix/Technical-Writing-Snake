# Snake Evolution v2.0

## Introduzione

Snake Evolution è una versione moderna del classico Snake arricchita da un sistema di evoluzione progressivo basato sulla lunghezza raggiunta dal serpente. Il gioco offre sessioni rapide (5-10 min) e mira alla massima accessibilità grazie a feedback visivi/sonori, leaderboard locale e persistenza automatica dei punteggi [file:1].

## Funzionalità

- Evoluzione dinamica in 5 stadi con cambi di colore, velocità ed effetti speciali.
- Gameplay fluido e progressivo.
- Salvataggio automatico dei progressi, high score e recovery.
- Leaderboard locale (top 10).
- Compatibilità: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+.
- Nessuna dipendenza esterna: Vanilla JavaScript, Canvas 2D, Web Audio [file:1][file:4].

## Installazione

### Prerequisiti

- Node.js ≥ 14
- Browser moderno compatibile
- 50 MB memoria libera, 500 KB di storage locale

### Setup

git clone https://github.com/tuoaccount/snake-evolution.git
cd snake-evolution
npm install
npm run dev


La build usa Webpack e Babel; il testing utilizza Jest + Testing Library [file:4].

## Avvio Rapido

1. Apri la pagina principale (`http://localhost:8080` di default).
2. Inserisci il nome utente.
3. Premi "Play".
4. Controlla il serpente con frecce, WASD o swipe touch.
5. Raccogli cibo per crescere e accedere agli stadi evolutivi.
6. Visualizza e salva il punteggio nella leaderboard [file:1][file:3].

## Meccaniche di Gioco

- **Movimento**: Serpente sempre in movimento; controlli con buffering e validazione per evitare errori (no cambi a 180°) [file:3][file:4].
- **Crescita**: Ogni cibo raccolto aumenta di 10 il punteggio e la lunghezza.
- **Collisioni**: Game over al contatto col bordo o con il proprio corpo.
- **Evoluzione**: Cambi di colore/velocità/FX in base alla lunghezza (verde base 0-10, blu 11-25, verde scuro 26-50, rosso 51-75, oro 76+) [file:1].
- **Effetti**: Animazioni/audio per ogni evoluzione.
- **Leaderboard**: Archivio punteggi con recupero automatico [file:1].

## Architettura & Tecnologie

- **Frontend**: HTML5, CSS3 (Flexbox/Grid), ES6+ JavaScript.
- **Grafica**: Canvas 2D.
- **Audio**: Web Audio API.
- **Dati**: localStorage con checksum, backup e recovery [file:4].
- **Testing**: Unit/property-based test su collisioni, stato, input ed evoluzione. Chaos/load test per edge case [file:2][file:4].
- **Performance**: Ottimizzazione rendering con dirty rectangle, collision detection O(1) spaziale, profiling input latency (<16ms) [file:3][file:4].

## Testing & Deployment

npm test # esegue tutti i test
npm run profile # profiling performance
npm run build # crea la build finale


Copia la cartella `dist` su un server web statico [file:4].

## Sicurezza & Privacy

- Validazione input utente, rate limiting, debouncing.
- Recovery automatico dati.
- GDPR: esportazione e cancellazione dati su richiesta [file:1][file:2].

## Troubleshooting

- Audio muto su mobile: interagire con la schermata.
- In caso di crash: backup e recovery automatico.
- Consulta `docs/deployment.md` per dettagli avanzati [file:2][file:4].

## Autori & Licenza

Creato da Senior Software Architect – Snake Evolution Team.
Licenza MIT o come indicato nel repository.