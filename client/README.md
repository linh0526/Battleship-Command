# Battleship Game - Stitch Design Implementation

🎮 **Battleship Game Project** được xây dựng dựa trên 4 màn hình design từ Google Stitch với dark theme và premium aesthetics.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Truy cập ứng dụng tại: **http://localhost:3000**

## 📱 Screens

### 1. **Lobby** (`/`)
- 🏠 Room management interface
- 🎖️ Active operations list với difficulty levels
- 🏆 Top commanders leaderboard
- 💬 Real-time chat (Comms Uplink)
- 🚀 Quick deploy button

### 2. **Ship Placement** (`/placement`)
- 🗺️ 10x10 strategic grid
- 🚢 5 ships với drag-and-drop (Carrier, Battleship, Cruiser, Submarine, Destroyer)
- 🎲 Random placement option
- 🔄 Ship rotation controls
- ⚡ Fleet deployment confirmation

### 3. **Battle Arena** (`/battle`)
- ⚔️ Dual grid system (Enemy Waters + My Fleet)
- 💥 Real-time battle với hit/miss indicators
- 📜 Battle log tracking
- ⚡ Tactical abilities (Radar Scan, Airstrike)
- ⏱️ Turn timer

### 4. **Leaderboard** (`/leaderboard`)
- 🏆 Global fleet rankings table
- 📊 Player stats (Wins, Losses, Win Rate, ELO)
- 📈 Trend indicators (up/down/same)
- 🌊 Live statistics (Total battles, Players online, Elite commanders)
- 🎯 Filter tabs (Global, Friends, Weekly)

## 🎨 Design System

### Theme Configuration
- **Color Mode**: Dark
- **Primary Color**: `#195de6` (Stitch blue)
- **Font**: BE Vietnam Pro
- ** Roundness**: 8px
- **Saturation**: Level 3

### Key Design Tokens
```css
/* Colors */
--primary: #195de6
--background: #0a0e1a
--background-card: #111827
--foreground: #f9fafb

/* Grid Colors */
--grid-ocean: #1e3a5f
--grid-hit: #ef4444
--grid-miss: #60a5fa
--grid-ship: #6366f1

/* Border Radius */
--radius: 8px
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Font**: Google Fonts - BE Vietnam Pro
- **Icons**: Emoji + SVG

## 📁 Project Structure

```
battleship-stitch/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx             # Lobby screen
│   ├── placement/
│   │   └── page.tsx         # Ship placement
│   ├── battle/
│   │   └── page.tsx         # Battle arena
│   └── leaderboard/
│       └── page.tsx         # Leaderboard
├── lib/
│   └── design-tokens.ts     # Design system tokens
├── public/                  # Static assets
└── globals.css             # Tailwind v4 theme config
```

## 🎯 Features

✅ **Premium Dark Theme** - Inspired by Stitch design với professional aesthetics  
✅ **Responsive Design** - Mobile-first approach  
✅ **Interactive Grids** - 10x10 battleship grids với hover effects  
✅ **Smooth Animations** - Fade-in transitions, hover states  
✅ **Type-Safe** - Full TypeScript support  
✅ **Modern Stack** - Next.js 16 với Turbopack (blazing fast)  

## 🌈 Design Highlights

- **Card-based UI** với glassmorphism effects
- **Gradient backgrounds** cho premium feel
- **Custom scrollbar** matching theme colors
- **Hover states** và micro-interactions
- **Grid cells** với ocean, hit, miss, ship states
- **Shadow system** với glow effects

## 🔮 Future Enhancements

- [ ] Socket.IO integration cho real-time multiplayer
- [ ] Drag-and-drop ship placement functionality
- [ ] Game state management (Zustand/Context)
- [ ] Sound effects và animations
- [ ] User authentication
- [ ] Game history và replays
- [ ] Mobile responsive optimizations

## 📸 Screenshots

Visit the screens at:
- Lobby: http://localhost:3000
- Placement: http://localhost:3000/placement
- Battle: http://localhost:3000/battle
- Leaderboard: http://localhost:3000/leaderboard

---

**Built with ❤️ using Google Stitch Design System**
