# Snake Evolution Game

## Overview
Snake Evolution is a modern, HTML5-based implementation of the classic Snake game with an innovative evolution mechanic. The game features 5 distinct evolution stages that change the snake's appearance and gameplay as it grows, creating a progressively challenging and rewarding experience.

## Project Structure
```
.
├── index.html          # Main HTML structure with all game screens
├── styles.css          # Complete styling for UI and game canvas
├── game.js            # Core game logic, evolution system, and state management
├── server.py          # Python HTTP server with cache-control headers
├── Docs/              # Product requirements and technical documentation
│   ├── Snake Evo 1.0/ # Version 1.0 documentation (PRD, technical analysis)
│   └── Snake Evo 2.0/ # Version 2.0 planning documents
└── meetings/          # Meeting notes and minutes
```

## Features Implemented

### Core Gameplay
- Classic Snake mechanics with smooth movement
- Food collection and growth system
- Collision detection (walls and self-collision)
- Score tracking and high score persistence
- 20x20 grid game board (500px × 500px)

### Evolution System (5 Stages)
1. **Base Stage** (0-10 segments): Green snake, standard speed
2. **Growing Stage** (11-25 segments): Blue snake, +5% speed
3. **Aware Stage** (26-50 segments): Purple snake with eyes, +10% speed, glowing trail
4. **Enhanced Stage** (51-75 segments): Red snake, +15% speed, particle effects
5. **Legendary Stage** (76+ segments): Golden snake with crown, +20% speed, aura effects

### UI Components
- Main menu with Play, Leaderboard, and Settings
- In-game HUD showing score, high score, evolution stage, and snake length
- Pause screen (Escape key or Pause button)
- Game Over screen with score summary
- Leaderboard showing top 10 scores
- Settings panel for audio controls

### Controls
- **Keyboard**: Arrow keys or WASD
- **Touch**: Swipe gestures on canvas or on-screen touch buttons
- **Pause**: Escape key or Pause button

### Data Persistence
- High scores saved to localStorage
- Leaderboard (top 10) with player names and timestamps
- Player name memory
- Sound/music settings persistence

### Audio
- Web Audio API-based sound effects:
  - Food collection beep
  - Evolution upgrade sound
  - Game over sound
- Toggle controls for sound effects and music

## Technical Details

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas, CSS3
- **Server**: Python 3.11 HTTP server
- **Storage**: Browser localStorage
- **Audio**: Web Audio API

### Performance
- 60 FPS target rendering
- Adaptive speed based on evolution stage
- Optimized particle system for visual effects
- Cache-control headers to prevent stale content

### Browser Compatibility
- Modern browsers with ES6+ support
- Canvas 2D API support required
- Web Audio API for sound effects
- Touch events for mobile devices

## Development Setup

### Running Locally
The game is configured to run on port 5000 using a Python HTTP server:
```bash
python server.py
```

The server includes cache-control headers to ensure fresh content delivery, which is important for the Replit iframe preview system.

### Deployment
The project is configured for Replit's autoscale deployment:
- Deployment type: Autoscale (stateless web app)
- Run command: `python server.py`
- Port: 5000
- The game works entirely client-side with localStorage, making it perfect for autoscale deployment

## Game Design Notes

### Evolution Progression
- Each evolution stage is unlocked by snake length milestones
- Visual feedback includes color changes, effects, and animations
- Speed increases with each evolution, creating progressive difficulty
- Sound effects play on evolution to celebrate player achievement

### Difficulty Curve
- Game starts easy with slow speed
- As snake grows and evolves, speed increases up to 20%
- Longer snake body creates natural difficulty increase
- Progressive challenge keeps players engaged

### User Experience
- Mobile-friendly with touch controls
- Keyboard support for desktop
- Clear visual feedback for all actions
- Persistent data enhances replay value
- Leaderboard creates competitive element

## Future Enhancement Ideas (from v2.0 docs)
- Multiple difficulty levels
- Additional game modes
- More evolution stages
- Custom skins and themes
- Sound/music improvements
- Social features
- Achievements system

## Recent Changes
**November 5, 2025**
- Initial implementation of Snake Evolution game
- Complete game mechanics with 5 evolution stages
- Full UI/UX implementation with all screens
- localStorage integration for persistence
- Python HTTP server setup for Replit
- Deployment configuration for production

## Status
✅ **Ready for Production**
All core features from the PRD v1.0 have been implemented and tested.
