/**
 * ============================================
 * ARCADE ULTIMATE - MAIN.JS
 * Point d'entrée principal
 * Initialisation et connexion de tous les modules
 * ============================================ */

// ============================================
// CONFIGURATION GLOBALE
// ============================================
const ARCADE_CONFIG = {
    APP_NAME: 'ARCADE ULTIMATE',
    VERSION: '2.0.0',
    DEBUG: false,
    
    // Performance
    TARGET_FPS: 60,
    DELTA_TIME_CAP: 0.1,
    
    // Audio
    AUDIO_ENABLED: true,
    MASTER_VOLUME: 0.5,
    
    // Stockage
    STORAGE_PREFIX: 'arcade_ultimate_'
};

// ============================================
// CLASSE PRINCIPALE D'APPLICATION
// ============================================
class ArcadeApp {
    constructor() {
        this.engine = null;
        this.soundManager = null;
        this.storageManager = null;
        this.isInitialized = false;
        
        console.log(`%c🎮 ${ARCADE_CONFIG.APP_NAME} v${ARCADE_CONFIG.VERSION}`, 
            'color: #6366f1; font-size: 20px; font-weight: bold;');
        console.log('%cChargement des modules...', 'color: #94a3b8;');
    }
    
    async init() {
        try {
            // 1. Initialiser le moteur de jeu
            console.log('⚙️  Initialisation du GameEngine...');
            this.engine = engine; // Utiliser l'instance globale créée dans core.js
            
            // 2. Initialiser le gestionnaire de sons
            console.log('🔊 Initialisation du SoundManager...');
            this.soundManager = new SoundManager();
            if (ARCADE_CONFIG.AUDIO_ENABLED) {
                // L'audio sera initialisé au premier interaction utilisateur
                document.addEventListener('click', () => {
                    if (!this.soundManager.context) {
                        this.soundManager.init();
                    }
                }, { once: true });
                document.addEventListener('keydown', () => {
                    if (!this.soundManager.context) {
                        this.soundManager.init();
                    }
                }, { once: true });
            }
            
            // Connecter le sound manager à l'engine
            if (this.engine) {
                this.engine.soundManager = this.soundManager;
            }
            
            // 3. Initialiser le stockage
            console.log('💾 Initialisation du StorageManager...');
            this.storageManager = new StorageManager(ARCADE_CONFIG.STORAGE_PREFIX);
            
            // 4. Charger les statistiques sauvegardées
            this.loadSavedStats();
            
            // 5. Configurer les événements globaux
            this.setupGlobalEvents();
            
            // 6. Démarrer le chargement
            console.log('🚀 Démarrage du chargement...');
            await this.startLoadingSequence();
            
            this.isInitialized = true;
            
            console.log('%c✅ Application initialisée avec succès!', 
                'color: #10b981; font-size: 14px; font-weight: bold;');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showErrorScreen(error);
        }
    }
    
    async startLoadingSequence() {
        return new Promise((resolve) => {
            const loadingBar = document.getElementById('loadingBar');
            const loadingPercent = document.getElementById('loadingPercent');
            const loadingScreen = document.getElementById('loadingScreen');
            
            let progress = 0;
            const steps = [
                { progress: 20, label: 'Chargement du moteur...' },
                { progress: 40, label: 'Initialisation audio...' },
                { progress: 60, label: 'Préparation des jeux...' },
                { progress: 80, label: 'Configuration UI...' },
                { progress: 100, label: 'Prêt!' }
            ];
            
            let currentStep = 0;
            
            const interval = setInterval(() => {
                if (currentStep < steps.length) {
                    const step = steps[currentStep];
                    
                    // Animation progressive vers l'étape suivante
                    const targetProgress = step.progress;
                    const increment = (targetProgress - progress) * 0.15 + 1;
                    progress = Math.min(progress + increment, targetProgress);
                    
                    if (loadingBar) loadingBar.style.width = `${progress}%`;
                    if (loadingPercent) loadingPercent.textContent = `${Math.floor(progress)}%`;
                    
                    if (progress >= targetProgress) {
                        currentStep++;
                    }
                } else {
                    clearInterval(interval);
                    
                    // Fin du chargement
                    setTimeout(() => {
                        if (loadingScreen) {
                            loadingScreen.classList.add('hidden');
                        }
                        
                        const mainMenu = document.getElementById('mainMenu');
                        if (mainMenu) {
                            mainMenu.classList.remove('hidden');
                        }
                        
                        resolve();
                    }, 500);
                }
            }, 50);
        });
    }
    
    loadSavedStats() {
        try {
            const stats = this.storageManager.load('global_stats', {
                totalGamesPlayed: 0,
                totalScore: 0,
                favoriteGame: null,
                playTime: 0
            });
            
            console.log('📊 Statistiques chargées:', stats);
            this.globalStats = stats;
        } catch (e) {
            console.warn('Impossible de charger les statistiques:', e);
            this.globalStats = {
                totalGamesPlayed: 0,
                totalScore: 0,
                favoriteGame: null,
                playTime: 0
            };
        }
    }
    
    saveGlobalStats() {
        if (this.storageManager && this.globalStats) {
            this.storageManager.save('global_stats', this.globalStats);
        }
    }
    
    setupGlobalEvents() {
        // Raccourcis clavier globaux
        document.addEventListener('keydown', (e) => {
            // F11 pour plein écran
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
            
            // Échap pour retour au menu (si dans un jeu)
            if (e.key === 'Escape' && this.engine?.currentGame) {
                // L'engine gère déjà ça, mais on peut ajouter un comportement ici
            }
            
            // M pour mute
            if (e.key === 'm' || e.key === 'M') {
                if (this.soundManager) {
                    const enabled = this.soundManager.toggle();
                    this.showNotification(
                        enabled ? '🔊 Son activé' : '🔇 Son désactivé'
                    );
                }
            }
        });
        
        // Visibility change (pause quand on change d'onglet)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.engine?.currentGame && !this.engine.gameOver) {
                // Pause automatique
                if (!this.engine.isPaused) {
                    this.engine.togglePause();
                }
            }
        });
        
        // Redimensionnement fenêtre
        window.addEventListener('resize', () => {
            if (this.engine) {
                this.engine.handleResize();
            }
        });
        
        // Empêcher le menu contextuel sur le canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
        
        // Prevention du scroll sur mobile pendant le jeu
        document.body.addEventListener('touchmove', (e) => {
            if (this.engine?.currentGame) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Erreur fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    showNotification(message, duration = 2000) {
        // Créer un élément notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-family: 'Rajdhani', sans-serif;
            font-size: 16px;
            z-index: 99999;
            animation: slideDown 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    showErrorScreen(error) {
        const container = document.getElementById('gameContainer') || document.body;
        
        container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: #0a0a12;
                color: #fff;
                font-family: 'Rajdhani', sans-serif;
                text-align: center;
                padding: 40px;
            ">
                <h1 style="font-size: 48px; color: #ef4444; margin-bottom: 20px;">⚠️ Erreur</h1>
                <p style="font-size: 18px; color: #94a3b8; margin-bottom: 30px;">
                    Une erreur est survenue lors du chargement:<br>
                    <code style="color: #f87171;">${error.message}</code>
                </p>
                <button onclick="location.reload()" style="
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05')" onmouseout="this.style.transform='scale(1)'">
                    🔄 Recharger la page
                </button>
            </div>
            
            <style>
                @keyframes slideDown {
                    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 1; transform: translateX(-50%) translateY(0); }
                    to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                }
            </style>
        `;
    }
}

// ============================================
// ANIMATIONS CSS SUPPLÉMENTAIRES
// ============================================
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    /* Notification animations */
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    
    /* Smooth transitions pour tous les éléments */
    * {
        transition-property: background-color, border-color, color, opacity, transform, box-shadow;
        transition-duration: 0.2s;
        transition-timing-function: ease;
    }
    
    /* Selection custom */
    ::selection {
        background: rgba(99, 102, 241, 0.4);
        color: white;
    }
    
    /* Scrollbar pour les notifications */
    ::-webkit-scrollbar {
        width: 8px;
    }
    ::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.5);
    }
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #6366f1, #8b5cf6);
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #818cf8, #a78bfa);
    }
    
    /* Focus styles pour accessibilité */
    button:focus-visible,
    [tabindex]:focus-visible {
        outline: 2px solid #6366f1;
        outline-offset: 2px;
    }
    
    /* Print styles */
    @media print {
        body {
            background: white !important;
            color: black !important;
        }
        .no-print {
            display: none !important;
        }
    }
`;
document.head.appendChild(additionalStyles);

// ============================================
// DÉMARRAGE DE L'APPLICATION
// ============================================
const app = new ArcadeApp();

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// ============================================
// UTILITAIRES DE DÉBOGAGE
// ============================================
if (ARCADE_CONFIG.DEBUG) {
    window.arcadeDebug = {
        engine: () => app.engine,
        sound: () => app.soundManager,
        storage: () => app.storageManager,
        config: ARCADE_CONFIG,
        
        // Fonctions utiles pour debug
        showFPS: () => {
            if (app.engine) {
                setInterval(() => {
                    console.log(`[DEBUG] FPS: ${app.engine.fps}`);
                }, 1000);
            }
        },
        
        unlockAllGames: () => {
            console.log('[DEBUG] Tous les jeux débloqués!');
        },
        
        addScore: (amount = 10000) => {
            if (app.engine) {
                app.engine.score += amount;
                app.engine.updateScoreDisplay();
                console.log(`[DEBUG] Score ajouté: ${amount}`);
            }
        },
        
        skipToWin: () => {
            if (app.engine?.currentGame) {
                app.engine.currentGame.endGame(true, '🏆 VICTOIRE (DEBUG)', '🏆');
            }
        }
    };
    
    console.log('%c🔧 Mode DEBUG actif!', 'color: #f59e0b; font-size: 14px;');
    console.log('Utilisez window.arcadeDebug pour accéder aux outils de debug');
}

// ============================================
// SERVICE WORKER POUR PWA (optionnel)
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Le service worker pourrait être ajouté plus tard pour une expérience PWA
        console.log('[PWA] Service Worker supporté (non activé)');
    });
}

// ============================================
// PERFORMANCE MONITORING
// ============================================
window.addEventListener('error', (e) => {
    console.error('[ERROR Global]', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('[PROMISE ERROR]', e.reason);
});

// Mesurer les performances
const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
            if (entry.duration > 100) {
                console.warn(`[PERF] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
            }
        }
    }
});
perfObserver.observe({ entryTypes: ['measure'] );

console.log('%c🎮 Arcade Ultimate - Prêt!', 
    'color: #10b981; font-size: 16px; font-weight: bold; padding: 10px 20px; background: rgba(16, 185, 129, 0.1); border-radius: 5px;');
