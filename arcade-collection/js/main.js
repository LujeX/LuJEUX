/**
 * MAIN.JS - Point d'entrée de l'application
 * Initialise le moteur et démarre le chargement
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('%c🎮 ARCADE ULTIMATE - LuJEUX', 'color: #6366f1; font-size: 20px; font-weight: bold;');
    console.log('%cChargement en cours...', 'color: #94a3b8;');
    
    try {
        await engine.simulateLoading();
        console.log('%c✅ Prêt !', 'color: #10b981; font-size: 14px; font-weight: bold;');
    } catch (error) {
        console.error('❌ Erreur au démarrage:', error);
    }
});
