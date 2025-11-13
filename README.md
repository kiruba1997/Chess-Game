# Chess Game - Single Player vs AI

A fully-featured chess game built with HTML, CSS, and JavaScript. Play against an AI opponent with support for all chess rules including castling, en passant, and pawn promotion.

## Features

- ✅ Complete chess engine with all rules
- ✅ AI opponent (simple heuristic-based)
- ✅ Move validation and legal move highlighting
- ✅ Check/Checkmate detection
- ✅ Castling (king-side and queen-side)
- ✅ En passant captures
- ✅ Pawn promotion with choice of piece
- ✅ Move history and undo
- ✅ Captured pieces display
- ✅ Hint system

## How to Play

1. **Local:** Simply open `index.html` in your web browser
2. **Online:** Deploy to any static hosting service (see hosting options below)

## Hosting Options

### Option 1: GitHub Pages (Free & Easy)

1. Create a GitHub repository
2. Upload all files from this folder
3. Go to Settings → Pages
4. Select branch and folder (usually `main` and `/` or `/root`)
5. Your site will be live at: `https://yourusername.github.io/repository-name`

**Steps:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/chess-game.git
git push -u origin main
```

Then enable GitHub Pages in repository settings.

---

### Option 2: Netlify (Free & Fast)

1. Go to [netlify.com](https://netlify.com)
2. Sign up/login (free)
3. Drag and drop the `chess-game` folder onto Netlify dashboard
4. Your site is live instantly at: `https://random-name.netlify.app`
5. (Optional) Add custom domain

**Or use Netlify CLI:**
```bash
npm install -g netlify-cli
cd chess-game
netlify deploy
netlify deploy --prod  # for production
```

---

### Option 3: Vercel (Free & Modern)

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login (free)
3. Click "New Project"
4. Import your GitHub repo or drag & drop the folder
5. Deploy - done!

**Or use Vercel CLI:**
```bash
npm install -g vercel
cd chess-game
vercel
vercel --prod  # for production
```

---

### Option 4: Firebase Hosting (Free)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

---

### Option 5: Surge.sh (Free - Simple)

```bash
npm install -g surge
cd chess-game
surge
# Follow prompts, done!
```

---

### Option 6: Any Web Server

The files work on any web server:
- Apache
- Nginx
- IIS (Windows)
- Python: `python -m http.server 8000`
- Node.js: `npx serve chess-game`
- VS Code Live Server extension

---

## File Structure

```
chess-game/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── js/
│   ├── chess-engine.js  # Game logic & rules
│   ├── chess-ai.js      # AI opponent
│   └── chess-ui.js      # UI interactions
└── README.md           # This file
```

## Requirements

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No server or backend needed - works offline!

## License

Free to use and modify.

