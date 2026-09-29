# SynchroBlock Duel: Overdrive Edition (Block Wars 2)

> **High-Octane Cyberpunk Neon Head-to-Head Block Puzzle Battle**  
> Built with **React 19**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, **HTML5 Canvas FX Engine**, and **Web Audio API**.

---

## ⚡ Game Overview

**SynchroBlock Duel: Overdrive Edition** is a simultaneous competitive block-puzzle game where both players receive the **EXACT SAME block shape each turn**. Both players maneuver at the same time and enter the `READY` state once they lock in. Once both players are locked (or the optional adrenaline blitz timer hits 0), the turn resolves simultaneously.

### 🌟 Key Enhancements in Overdrive Edition
- **Cyberpunk Neon Crystal Aesthetics**: Deep obsidian space background (`#090A0F`), 3D beveled neon cells, wireframe ghost silhouette, responsive animated energy plasma laser clash divider.
- **HTML5 Canvas Particle & FX Overlay Engine**: Luminous neon spark bursts on line clears, radial fire shockwaves on bomb detonations, electric piercing laser beams for drills, directional spring screen shake, and floating arcade combat popups (`+800!`, `SYNCHRO-QUAD!`, `COUNTER-ATTACK!`, `SHIELDED!`).
- **100% Native Procedural Web Audio API Synthesizer**: Zero external audio files. Dynamic synthwave music generator that automatically ramps up tempo and filter resonance when either player enters the critical danger zone (>75% height).
- **Two Distinct View Modes**:
  1. **Arena Split**: Side-by-side vertical drop boards with central laser clash HUD, ideal for desktop/laptop play.
  2. **Tabletop Duel**: Opposing clash mode with Player 2 inverted 180° for head-to-head iPad / tablet gameplay.
- **Smart Multi-Tier AI**: Play 1P vs AI, 2P Local Duel, or AI vs AI Spectator mode with Easy, Medium, and Hard heuristic lookahead.

---

## 🎮 5 Game Modes

1. **Versus Duel**: Classic competitive battle. Clearing 2+ lines sends retaliatory counter-garbage rows with random gaps to overwhelm the opponent.
2. **War Mode**: Clearing lines charges the **WAR METER** (0–100%). Deploy tactical abilities:
   - **Aegis Shield**: Deploys an energy barrier absorbing the next incoming garbage volley.
   - **Board Push**: Gravity Inversion pushes your entire stack down 3 rows toward safety.
   - **Mirage Cloak**: Cloaks opponent field, rendering their active piece invisible for the next turn.
   - **Plasma Push**: Overcharges the reactor to instantly fire 3 dense garbage rows into the enemy's field.
3. **Score Attack**: Fixed piece quota (25, 50, or 100 synchronized pieces). High score wins upon quota completion.
4. **Endurance Survival**: Rising radioactive garbage waves emerge every 5 synchronized turns.
5. **Wacky Chaos**: Reality fractures every 5 turns with unexpected glitch events:
   - *Control Reversal*: Inverted steering (Left is Right, Right is Left).
   - *Giganto-Bomb Injection*: Both players receive a massive 3x3 block detonating a 6x6 explosion!
   - *Field Quake*: Randomly shatters blocks across both fields.
   - *Blackout*: Darkens field where only active piece / ghost illuminates.

---

## 💣 4 Special Blocks (15% Weighted Bag Injection)

- **Bomb Block** ($3\times3$ blast radius area destruction).
- **Giganto-Bomb** ($6\times6$ cataclysmic nuclear explosion).
- **Drill Block** (Piercing electric laser that disintegrates the entire target column).
- **Garbage Sender** (Surges $+2$ bonus garbage lines to the opponent upon any line clear).

---

## 🕹️ Controls

### Keyboard Controls (Desktop)
| Action | Player 1 | Player 2 |
|---|---|---|
| **Rotate (SRS)** | `W` | `Up Arrow` |
| **Shift Left / Right** | `A` / `D` | `Left Arrow` / `Right Arrow` |
| **Soft Drop** | `S` | `Down Arrow` |
| **Hard Drop / Lock In** | `Space` | `Enter` / `Right Shift` |
| **War Abilities** | `Q` (Shield) / `E` (Plasma) | `/` (Plasma) |
| **Pause / Resume** | `Esc` or `P` | `Esc` or `P` |

### Touch & Mobile Gamepads
- Ergonomic on-screen virtual gamepads designed for thumb play with active glow feedback and `navigator.vibrate` haptic pulses.

---

## 🛠️ Project Architecture

```
Block Wars/
├── src/
│   ├── audio/
│   │   └── SoundEngine.ts         # Native Web Audio API procedural SFX & synthwave music
│   ├── components/
│   │   ├── Modals/
│   │   │   ├── GameOverModal.tsx  # Post-match telemetry, APM, confetti celebration
│   │   │   ├── RulesModal.tsx     # In-game operational guide & controls manual
│   │   │   ├── SettingsModal.tsx  # Audio sliders, blitz protocols, display toggles
│   │   │   └── StartMenu.tsx      # Cyberpunk mode selection & match configuration
│   │   ├── ClashDivider.tsx       # Animated high-voltage plasma laser clash line
│   │   ├── FXCanvas.tsx           # High-performance HTML5 canvas particle & shockwave engine
│   │   ├── GameHUD.tsx            # Glassmorphic HUD, synchronized next piece, war meters
│   │   ├── Playfield.tsx          # Crystal beveled cells, ghost wireframe, status overlays
│   │   └── VirtualControls.tsx    # Responsive touch gamepads with haptic feedback
│   ├── hooks/
│   │   └── useGameEngine.ts       # Synchronized turns, collision, SRS kicks, garbage cancellation
│   ├── utils/
│   │   ├── aiController.ts        # Multi-tier lookahead heuristics (Easy, Medium, Hard)
│   │   ├── bagGenerator.ts        # 7-bag randomizer with 15% special piece injection
│   │   └── srsRotation.ts         # Super Rotation System wall/floor kick offsets
│   ├── App.tsx                    # Main duel container, view mode router, keyboard listeners
│   ├── constants.ts               # Shapes, colors, SRS kicks, scoring rules, abilities
│   ├── types.ts                   # Complete TypeScript interfaces and state models
│   ├── index.css                  # Cyberpunk neon styles, glassmorphism, scanlines
│   └── main.tsx                   # React 19 bootstrap
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Running the Game Locally

1. Navigate to the project directory:
   ```bash
   cd "Block Wars"
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:5175/
   ```
4. Build for production:
   ```bash
   npm run build
   ```
