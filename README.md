# 3D Basketball Game 🏀

A fun and interactive 3D basketball shooting game built with React and Three.js! Experience realistic physics, smooth animations, and test your shooting skills with a power-charging system.

![Basketball Game](https://img.shields.io/badge/Game-3D%20Basketball-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.158-black?style=for-the-badge&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)

## 🎮 Live Demo

Play the game live: **[Basketball 3D Game](https://basketball-3d-game.vercel.app)**

> **Note**: If the live demo link doesn't work, the project can be easily deployed to Vercel, Netlify, or GitHub Pages. See deployment instructions below.

## 📺 Gameplay Preview

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    🏀 SWISH! 🏀                        │
│                 Great shot! +2 points!                 │
│                                                         │
│    [Ball flies through the air with rotation]           │
│                    ⟳ 🏃 💨                              │
│                                                         │
│    [Power bar fills up]                                │
│    ████████████░░░░░░░░░░░░░░░░░░░ 65%               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ✨ New Features

### 🔊 Sound Effects
- **Swish sound** - When you score!
- **Shoot sound** - Whoosh when ball is launched
- **Power-up sounds** - Chimes when activating power-ups
- Audio generated using Web Audio API (no external files needed)

### 🏆 Leaderboard
- Submit your score with your name
- Compete against other players
- Top 5 scores displayed
- Persistent during gameplay session

### ⚡ Power-Up System
Collect glowing power-ups that appear randomly after scoring:

| Power-Up | Color | Effect | Duration |
|----------|-------|--------|----------|
| **2X Points** | 🟡 Gold | Double your points per shot | 10 seconds |
| **Super Shot** | 🔥 Orange | Triple points + stronger shots | 8 seconds |
| **Slow Motion** | 🔵 Blue | Ball moves in slow motion | 12 seconds |

### 📱 Mobile Touch Controls
- Full touch support for mobile devices
- Touch and hold to charge
- Release to shoot
- Responsive design adapts to screen size

## 🎮 Features

- **3D Graphics**: Beautiful 3D basketball court with realistic hoop, backboard, and net
- **Physics Engine**: Realistic ball physics with gravity and trajectory calculations
- **Power Charging System**: Click and hold to charge your shot power
- **Score Tracking**: Real-time score and shot statistics
- **Accuracy Stats**: Track your shooting percentage
- **Smooth Animations**: Fluid ball rotation and flight path
- **Responsive Design**: Works on desktop and mobile devices

## 🎯 How to Play

1. **Charge Your Shot**: Click and hold the mouse (or touch and hold on mobile)
2. **Watch the Power Bar**: The bar fills up - green (low), yellow (medium), red (high power)
3. **Release to Shoot**: Let go to launch the basketball
4. **Score Points**: Get the ball through the hoop to score!
5. **Collect Power-ups**: Hit glowing orbs for special abilities
6. **Track Your Stats**: Monitor your score, total shots, and accuracy percentage

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yksanjo/basketball-3d-game.git
cd basketball-3d-game

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm start
```

## 🛠️ Technologies

- **[React](https://reactjs.org/)** - UI library
- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[Vite](https://vitejs.dev/)** - Build tool and dev server

## 📦 Project Structure

```
basketball-3d-game/
├── src/
│   ├── BasketballGame.jsx  # Main game component
│   └── main.jsx            # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## 🎮 Game Mechanics

- **Ball Physics**: Gravity-based trajectory with realistic arc
- **Collision Detection**: Precise scoring detection when ball passes through hoop
- **Power System**: Charge time affects shot distance and arc
- **Visual Feedback**: Power bar, score updates, and success messages

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Netlify
1. Connect your GitHub repo to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy!

### GitHub Pages
1. Go to repository Settings
2. Enable GitHub Pages
3. Select "gh-pages" branch or use Actions

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yksanjo/basketball-3d-game/issues).

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/) for amazing 3D graphics
- Powered by [React](https://reactjs.org/) for reactive UI
- Thanks to the open-source community!

## ⭐ Show Your Support

If you like this project, please give it a ⭐ on GitHub!

---

Made with ❤️ and 🏀
