/* ============================================
   ARCADE ULTIMATE - STYLES COMPLETS
   ============================================ */

:root {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --primary-light: #818cf8;
    --secondary: #ec4899;
    --accent: #06b6d4;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    
    --bg-dark: #0a0a0f;
    --bg-darker: #050508;
    --bg-card: rgba(15, 15, 25, 0.85);
    --bg-glass: rgba(255, 255, 255, 0.03);
    
    --text-primary: #ffffff;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-accent: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    --gradient-success: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.5);
    --shadow-glow: 0 0 30px rgba(99, 102, 241, 0.4);
    
    --border-color: rgba(255, 255, 255, 0.08);
    --border-glow: rgba(99, 102, 241, 0.5);
    
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
}

*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Rajdhani', sans-serif;
    background: var(--bg-dark);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--bg-darker); }
::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }
::selection { background: var(--primary); color: white; }

/* LOADING SCREEN */
#loadingScreen {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100vh;
    background: var(--bg-darker);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    transition: opacity 0.5s ease, visibility 0.5s ease;
}
#loadingScreen.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

.loader-container {
    position: relative;
    width: 150px; height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
}

.loader-ring {
    position: absolute;
    width: 100%; height: 100%;
    border: 3px solid transparent;
    border-radius: 50%;
    animation: loaderSpin 1.5s linear infinite;
}
.loader-ring:nth-child(1) { border-top-color: var(--primary); animation-duration: 1.2s; }
.loader-ring:nth-child(2) { width: 80%; height: 80%; border-right-color: var(--secondary); animation-duration: 1s; animation-direction: reverse; }
.loader-ring:nth-child(3) { width: 60%; height: 60%; border-bottom-color: var(--accent); animation-duration: 0.8s; }

@keyframes loaderSpin { to { transform: rotate(360deg); } }

.loader-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 4px;
    color: var(--text-secondary);
    animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

.loading-bar-container {
    width: 300px; height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
}
.loading-bar {
    width: 0%; height: 100%;
    background: var(--gradient-primary);
    border-radius: 2px;
    transition: width 0.3s ease;
    box-shadow: 0 0 15px var(--primary);
}
.loading-percent {
    font-family: 'Orbitron', sans-serif;
    font-size: 14px;
    color: var(--text-muted);
    margin-top: 15px;
    letter-spacing: 2px;
}

/* PARTICLES BG */
#particlesBg {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 0;
    pointer-events: none;
}

/* MAIN MENU */
#mainMenu {
    text-align: center;
    padding: 20px;
    min-height: 100vh;
    display: none;
    position: relative;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.5s ease;
}
#mainMenu.visible {
    display: block !important;
    opacity: 1 !important;
}

.menu-header {
    text-align: center;
    padding: 30px 20px 10px;
}

.main-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(2.5rem, 7vw, 5rem);
    font-weight: 900;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 8px;
    margin-bottom: 10px;
    line-height: 1.1;
}
.title-sub {
    font-size: clamp(1.2rem, 3vw, 2rem);
    display: block;
    letter-spacing: 15px;
    -webkit-text-fill-color: initial;
    color: var(--accent);
}

.subtitle {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 30px;
    min-height: 30px;
}
.cursor {
    animation: blink 1s step-end infinite;
    color: var(--primary);
    font-weight: bold;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.header-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
    margin-bottom: 20px;
}
.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}
.stat-number {
    font-family: 'Orbitron';
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
}
.stat-label {
    font-size: 0.75rem;
    letter-spacing: 3px;
    color: var(--text-muted);
}
.stat-divider {
    width: 1px; height: 40px;
    background: var(--border-color);
}

/* GAMES GRID */
.games-showcase {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}
.games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 10px;
}

.game-card {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 25px 20px;
    cursor: pointer;
    transition: all var(--transition-normal);
    overflow: hidden;
    backdrop-filter: blur(10px);
}
.game-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
        rgba(99, 102, 241, 0.15) 0%, transparent 50%);
    opacity: 0;
    transition: opacity var(--transition-normal);
    pointer-events: none;
}
.game-card:hover::before { opacity: 1; }
.game-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: var(--border-glow);
    box-shadow: var(--shadow-glow), var(--shadow-lg);
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
    position: relative;
    z-index: 2;
}
.card-icon {
    width: 90px; height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    transition: all var(--transition-normal);
}
.game-card:hover .card-icon {
    transform: scale(1.1) rotate(5deg);
    border-color: var(--primary);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}
.icon-svg { width: 55px; height: 55px; }

.card-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 3px;
    color: var(--text-primary);
}
.card-desc {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
}
.card-stats {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
}
.difficulty {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 2px;
    padding: 4px 12px;
    border-radius: 20px;
    text-transform: uppercase;
}
.difficulty.easy { background: rgba(16, 185, 129, 0.2); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
.difficulty.medium { background: rgba(245, 158, 11, 0.2); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.3); }
.difficulty.hard { background: rgba(239, 68, 68, 0.2); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); }

.players {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 2px;
    color: var(--text-muted);
    padding: 4px 12px;
    border-radius: 20px;
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
}

.play-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 28px;
    background: var(--gradient-primary);
    border: none;
    border-radius: 30px;
    color: white;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all var(--transition-normal);
}
.play-btn svg { width: 18px; height: 18px; fill: currentColor; }
.play-btn:hover { transform: scale(1.05); box-shadow: var(--shadow-glow); }

/* FOOTER */
.menu-footer {
    text-align: center;
    padding: 30px 20px;
    border-top: 1px solid var(--border-color);
    margin-top: 30px;
}
.footer-text { color: var(--text-muted); font-size: 0.95rem; }
.made-with { color: var(--text-secondary); font-size: 0.85rem; margin-top: 8px; }

/* GAME CONTAINER */
#gameContainer {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: var(--bg-darker);
    z-index: 1000;
    display: none;
    flex-direction: column;
}
#gameContainer.active { display: flex !important; }

.game-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 25px;
    background: rgba(10, 10, 15, 0.97);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    width: 100%;
    box-sizing: border-box;
    flex-wrap: wrap;
    gap: 10px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-secondary);
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--transition-fast);
}
.back-btn svg { width: 18px; height: 18px; stroke: currentColor; }
.back-btn:hover { background: rgba(239, 68, 68, 0.1); border-color: var(--danger); color: var(--danger); }

.game-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: 3px;
    background: var(--gradient-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.score-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 20px;
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: 12px;
}
.score-label { font-size: 0.65rem; letter-spacing: 2px; color: var(--text-muted); }
.score-value { font-family: 'Orbitron'; font-size: 1.5rem; font-weight: 700; color: var(--success); }

.canvas-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    overflow: hidden;
}

canvas#gameCanvas {
    border: 3px solid var(--primary);
    border-radius: 12px;
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.3), var(--shadow-lg);
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 180px);
    object-fit: contain;
    background: #000;
}

.canvas-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(5, 5, 8, 0.92);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}
.canvas-overlay.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

.overlay-content {
    text-align: center;
    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

.overlay-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 900;
    letter-spacing: 5px;
    margin-bottom: 20px;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
.overlay-message { font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 30px; }

.start-game-btn {
    padding: 16px 48px;
    background: var(--gradient-success);
    border: none;
    border-radius: 30px;
    color: white;
    font-family: 'Orbitron', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 3px;
    cursor: pointer;
    transition: all var(--transition-normal);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}
.start-game-btn:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 8px 30px rgba(16, 185, 129, 0.6); }

.game-controls-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 25px;
    background: rgba(10, 10, 15, 0.97);
    backdrop-filter: blur(10px);
    border-top: 1px solid var(--border-color);
    width: 100%;
    box-sizing: border-box;
    flex-wrap: wrap;
    gap: 10px;
}
.controls-info { color: var(--text-muted); font-size: 0.9rem; }
kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px; height: 28px;
    padding: 0 8px;
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-family: 'Orbitron';
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 2px;
}
.control-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
.ctrl-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-secondary);
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
}
.ctrl-btn:hover { background: rgba(99, 102, 241, 0.1); border-color: var(--primary); color: var(--primary-light); }
.restart-btn:hover { background: rgba(16, 185, 129, 0.1); border-color: var(--success); color: var(--success); }

/* MOBILE CONTROLS */
.mobile-controls {
    display: none;
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    gap: 20px;
    padding: 15px;
    background: rgba(10, 10, 15, 0.95);
    border-radius: 20px;
    border: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
}
@media (max-width: 768px) {
    .mobile-controls { display: flex !important; }
    .game-controls-panel { display: none !important; }
    .games-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .main-title { font-size: 2rem; letter-spacing: 4px; }
    .title-sub { font-size: 1rem; letter-spacing: 8px; }
}
@media (max-width: 480px) { .games-grid { grid-template-columns: 1fr; } }

.dpad {
    display: grid;
    grid-template-columns: repeat(3, 50px);
    grid-template-rows: repeat(3, 50px);
    gap: 4px;
}
.dpad-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-glass);
    border: 2px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    transition: all var(--transition-fast);
    touch-action: manipulation;
    user-select: none;
}
.dpad-btn:active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
    transform: scale(0.95);
}
.dpad-up { grid-column: 2; grid-row: 1; }
.dpad-left { grid-column: 1; grid-row: 2; }
.dpad-center { grid-column: 2; grid-row: 2; background: transparent; border: none; }
.dpad-right { grid-column: 3; grid-row: 2; }
.dpad-down { grid-column: 2; grid-row: 3; }

/* MODAL */
#resultModal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 10000;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
}
#resultModal.show { display: flex !important; }

.modal-content {
    background: linear-gradient(145deg, rgba(20, 20, 35, 0.98), rgba(10, 10, 20, 0.98));
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 40px;
    max-width: 450px;
    width: 90%;
    text-align: center;
    animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(99, 102, 241, 0.2);
}
@keyframes modalSlideIn { from { opacity: 0; transform: scale(0.85) translateY(30px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.modal-icon { font-size: 4rem; margin-bottom: 20px; animation: iconBounce 0.6s ease; }
@keyframes iconBounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }

.modal-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: 4px;
    margin-bottom: 20px;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
.modal-score-display {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 20px 30px;
    background: var(--bg-glass);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    margin-bottom: 20px;
}
.modal-score-label { font-size: 0.8rem; letter-spacing: 3px; color: var(--text-muted); }
.modal-score-value {
    font-family: 'Orbitron';
    font-size: 3rem;
    font-weight: 900;
    color: var(--success);
    text-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
}
.modal-actions { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }

.modal-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border: none;
    border-radius: 14px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all var(--transition-normal);
}
.modal-btn.primary { background: var(--gradient-primary); color: white; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4); }
.modal-btn.primary:hover { transform: translateY(-2px); }
.modal-btn.secondary { background: var(--bg-glass); color: var(--text-secondary); border: 1px solid var(--border-color); }
.modal-btn.secondary:hover { background: rgba(255, 255, 255, 0.05); }

.hidden { display: none !important; }
