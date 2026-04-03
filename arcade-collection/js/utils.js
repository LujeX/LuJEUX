// arcade-collection/js/utils.js

/**
 * ============================================
 * ARCADE COLLECTION - UTILITAIRES
 * Fonctions utilitaires partagées
 * ============================================
 */

'use strict';

const Utils = {
    /**
     * Générateur d'ID unique
     * @returns {string} ID unique
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Limitation d'une valeur entre min et max
     * @param {number} value - Valeur à limiter
     * @param {number} min - Minimum
     * @param {number} max - Maximum
     * @returns {number} Valeur limitée
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Nombre aléatoire entre min et max
     * @param {number} min - Minimum (inclus)
     * @param {number} max - Maximum (exclus)
     * @returns {number} Nombre aléatoire
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Entier aléatoire entre min et max (inclus)
     * @param {number} min - Minimum
     * @param {number} max - Maximum
     * @returns {number} Entier aléatoire
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Mélange un tableau (Fisher-Yates)
     * @param {Array} array - Tableau à mélanger
     * @returns {Array} Tableau mélangé
     */
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    /**
     * Formatage du temps en MM:SS
     * @param {number} secondes - Temps en secondes
     * @returns {string} Temps formaté
     */
    formatTime(secondes) {
        const mins = Math.floor(secondes / 60);
        const secs = Math.floor(secondes % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Formatage du score avec séparateurs
     * @param {number} score - Score à formater
     * @returns {string} Score formaté
     */
    formatScore(score) {
        return score.toLocaleString('fr-FR');
    },

    /**
     * Détection de collision AABB (Axis-Aligned Bounding Box)
     * @param {Object} rect1 - Premier rectangle {x, y, width, height}
     * @param {Object} rect2 - Deuxième rectangle {x, y, width, height}
     * @returns {boolean} Collision détectée
     */
    checkAABBCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    },

    /**
     * Détection de collision cercle-cercle
     * @param {Object} c1 - Premier cercle {x, y, radius}
     * @param {Object} c2 - Deuxième cercle {x, y, radius}
     * @returns {boolean} Collision détectée
     */
    checkCircleCollision(c1, c2) {
        const dx = c1.x - c2.x;
        const dy = c1.y - c2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < c1.radius + c2.radius;
    },

    /**
     * Détection de collision point-cercle
     * @param {number} px - Point X
     * @param {number} py - Point Y
     * @param {Object} circle - Cercle {x, y, radius}
     * @returns {boolean} Collision détectée
     */
    checkPointCircle(px, py, circle) {
        const dx = px - circle.x;
        const dy = py - circle.y;
        return Math.sqrt(dx * dx + dy * dy) < circle.radius;
    },

    /**
     * Calcul de la distance entre deux points
     * @param {number} x1 - X du premier point
     * @param {number} y1 - Y du premier point
     * @param {number} x2 - X du deuxième point
     * @param {number} y2 - Y du deuxième point
     * @returns {number} Distance
     */
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    /**
     * Interpolation linéaire (lerp)
     * @param {number} start - Valeur de départ
     * @param {number} end - Valeur d'arrivée
     * @param {number} t - Facteur (0-1)
     * @returns {number} Valeur interpolée
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Conversion degrés → radians
     * @param {number} deg - Degrés
     * @returns {number} Radians
     */
    degToRad(deg) {
        return deg * (Math.PI / 180);
    },

    /**
     * Conversion radians → degrés
     * @param {number} rad - Radians
     * @returns {number} Degrés
     */
    radToDeg(rad) {
        return rad * (180 / Math.PI);
    },

    /**
     * Gestionnaire de stockage local
     */
    storage: {
        /**
         * Sauvegarder des données
         * @param {string} key - Clé
         * @param {*} data - Données à sauvegarder
         */
        save(key, data) {
            try {
                localStorage.setItem(`arcade_${key}`, JSON.stringify(data));
            } catch (e) {
                console.warn('Erreur de sauvegarde:', e);
            }
        },

        /**
         * Charger des données
         * @param {string} key - Clé
         * @param {*} defaultValue - Valeur par défaut
         * @returns {*} Données chargées ou valeur par défaut
         */
        load(key, defaultValue = null) {
            try {
                const data = localStorage.getItem(`arcade_${key}`);
                return data ? JSON.parse(data) : defaultValue;
            } catch (e) {
                console.warn('Erreur de chargement:', e);
                return defaultValue;
            }
        },

        /**
         * Supprimer des données
         * @param {string} key - Clé
         */
        remove(key) {
            try {
                localStorage.removeItem(`arcade_${key}`);
            } catch (e) {
                console.warn('Erreur de suppression:', e);
            }
        },

        /**
         * Sauvegarder un score
         * @param {string} game - Nom du jeu
         * @param {number} score - Score
         */
        saveScore(game, score) {
            const scores = this.load('scores', {});
            if (!scores[game]) scores[game] = [];
            
            scores[game].push({
                score: score,
                date: new Date().toISOString()
            });
            
            // Garder seulement les 10 meilleurs scores
            scores[game].sort((a, b) => b.score - a.score);
            scores[game] = scores[game].slice(0, 10);
            
            this.save('scores', scores);
        },

        /**
         * Obtenir les meilleurs scores
         * @param {string} game - Nom du jeu (optionnel)
         * @returns {Array|Object} Scores
         */
        getScores(game = null) {
            const scores = this.load('scores', {});
            return game ? (scores[game] || []) : scores;
        },

        /**
         * Obtenir le meilleur score
         * @param {string} game - Nom du jeu
         * @returns {number} Meilleur score
         */
        getHighScore(game) {
            const scores = this.getScores(game);
            return scores.length > 0 ? scores[0].score : 0;
        }
    },

    /**
     * Système audio utilisant Web Audio API
     */
    audio: {
        context: null,
        masterGain: null,
        muted: false,

        /**
         * Initialiser le contexte audio
         */
        init() {
            if (!this.context) {
                try {
                    this.context = new (window.AudioContext || window.webkitAudioContext)();
                    this.masterGain = this.context.createGain();
                    this.masterGain.connect(this.context.destination);
                    this.masterGain.gain.value = 0.3;
                } catch (e) {
                    console.warn('Web Audio API non supportée:', e);
                }
            }
        },

        /**
         * Reprendre le contexte audio (nécessaire après interaction utilisateur)
         */
        resume() {
            if (this.context && this.context.state === 'suspended') {
                this.context.resume();
            }
        },

        /**
         * Jouer un son simple
         * @param {string} type - Type d'oscillateur ('sine', 'square', 'sawtooth', 'triangle')
         * @param {number} frequency - Fréquence en Hz
         * @param {number} duration - Durée en secondes
         * @param {number} volume - Volume (0-1)
         */
        playTone(type = 'sine', frequency = 440, duration = 0.1, volume = 0.5) {
            if (this.muted || !this.context) return;

            try {
                const oscillator = this.context.createOscillator();
                const gainNode = this.context.createGain();

                oscillator.type = type;
                oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

                gainNode.gain.setValueAtTime(volume, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.context.currentTime + duration
                );

                oscillator.connect(gainNode);
                gainNode.connect(this.masterGain);

                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + duration);
            } catch (e) {
                // Silencieux en cas d'erreur
            }
        },

        /**
         * Jouer un son de clic/bouton
         */
        playClick() {
            this.playTone('sine', 800, 0.05, 0.3);
        },

        /**
         * Jouer un son de succès
         */
        playSuccess() {
            this.playTone('sine', 523, 0.1, 0.4);
            setTimeout(() => this.playTone('sine', 659, 0.1, 0.4), 100);
            setTimeout(() => this.playTone('sine', 784, 0.15, 0.4), 200);
        },

        /**
         * Jouer un son d'échec
         */
        playError() {
            this.playTone('square', 200, 0.3, 0.3);
        },

        /**
         * Jouer un son de collision/rebond
         */
        playBounce() {
            this.playTone('triangle', 300, 0.08, 0.3);
        },

        /**
         * Jouer un son de game over
         */
        playGameOver() {
            this.playTone('sawtooth', 300, 0.2, 0.4);
            setTimeout(() => this.playTone('sawtooth', 200, 0.3, 0.4), 200);
            setTimeout(() => this.playTone('sawtooth', 100, 0.5, 0.4), 500);
        },

        /**
         * Activer/Désactiver le son
         * @returns {boolean} Nouvel état muet
         */
        toggleMute() {
            this.muted = !this.muted;
            if (this.masterGain) {
                this.masterGain.gain.value = this.muted ? 0 : 0.3;
            }
            return this.muted;
        }
    },

    /**
     * Animation et effets visuels
     */
    animation: {
        /**
         * Créer une animation de fondu
         * @param {HTMLElement} element - Élément à animer
         * @param {number} from - Opacité de départ
         * @param {number} to - Opacité d'arrivée
         * @param {number} duration - Durée en ms
         * @returns {Promise} Promesse résolue à la fin
         */
        fade(element, from, to, duration = 300) {
            return new Promise(resolve => {
                element.style.opacity = from;
                element.style.transition = `opacity ${duration}ms ease`;
                
                requestAnimationFrame(() => {
                    element.style.opacity = to;
                });
                
                setTimeout(resolve, duration);
            });
        },

        /**
         * Créer une animation de glissement
         * @param {HTMLElement} element - Élément à animer
         * @param {string} direction - Direction ('up', 'down', 'left', 'right')
         * @param {number} distance - Distance en pixels
         * @param {number} duration - Durée en ms
         * @returns {Promise} Promesse résolue à la fin
         */
        slide(element, direction, distance = 20, duration = 300) {
            return new Promise(resolve => {
                const transforms = {
                    up: [`translateY(${distance}px)`, 'translateY(0)'],
                    down: [`translateY(-${distance}px)`, 'translateY(0)'],
                    left: [`translateX(${distance}px)`, 'translateX(0)'],
                    right: [`translateX(-${distance}px)`, 'translateX(0)']
                };

                const [from, to] = transforms[direction];
                element.style.transform = from;
                element.style.transition = `transform ${duration}ms ease`;
                
                requestAnimationFrame(() => {
                    element.style.transform = to;
                });
                
                setTimeout(resolve, duration);
            });
        },

        /**
         * Créer un effet de pulsation
         * @param {HTMLElement} element - Élément à animer
         * @param {number} scaleMax - Échelle maximale
         * @param {number} duration - Durée d'un cycle en ms
         */
        pulse(element, scaleMax = 1.05, duration = 1000) {
            let growing = true;
            let scale = 1;
            
            const animate = () => {
                if (growing) {
                    scale += 0.001;
                    if (scale >= scaleMax) growing = false;
                } else {
                    scale -= 0.001;
                    if (scale <= 1) growing = true;
                }
                
                element.style.transform = `scale(${scale})`;
                requestAnimationFrame(animate);
            };
            
            animate();
        }
    },

    /**
     * Utilitaires pour Canvas
     */
    canvas: {
        /**
         * Créer un canvas avec contexte
         * @param {number} width - Largeur
         * @param {number} height - Hauteur
         * @returns {{canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}} Canvas et contexte
         */
        create(width, height) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            return { canvas, context };
        },

        /**
         * Effacer le canvas
         * @param {CanvasRenderingContext2D} ctx - Contexte
         * @param {number} width - Largeur
         * @param {number} height - Hauteur
         * @param {string} color - Couleur de fond
         */
        clear(ctx, width, height, color = '#0a0a0f') {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, width, height);
        },

        /**
         * Dessiner un rectangle arrondi
         * @param {CanvasRenderingContext2D} ctx - Contexte
         * @param {number} x - Position X
         * @param {number} y - Position Y
         * @param {number} width - Largeur
         * @param {number} height - Hauteur
         * @param {number} radius - Rayon des coins
         * @param {string} fill - Couleur de remplissage
         * @param {string} stroke - Couleur de contour (optionnel)
         */
        roundRect(ctx, x, y, width, height, radius, fill, stroke = null) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            
            if (fill) {
                ctx.fillStyle = fill;
                ctx.fill();
            }
            if (stroke) {
                ctx.strokeStyle = stroke;
                ctx.stroke();
            }
        },

        /**
         * Dessiner du texte avec effet glow
         * @param {CanvasRenderingContext2D} ctx - Contexte
         * @param {string} text - Texte
         * @param {number} x - Position X
         * @param {number} y - Position Y
         * @param {Object} options - Options de style
         */
        drawGlowText(ctx, text, x, y, options = {}) {
            const {
                font = 'bold 24px Orbitron',
                color = '#ffffff',
                glowColor = '#64b5f6',
                glowSize = 10,
                align = 'center'
            } = options;

            ctx.save();
            ctx.font = font;
            ctx.textAlign = align;
            ctx.textBaseline = 'middle';

            // Glow effect
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = glowSize;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);

            // Text sans glow pour plus de netteté
            ctx.shadowBlur = 0;
            ctx.fillText(text, x, y);

            ctx.restore();
        },

        /**
         * Créer un dégradé radial
         * @param {CanvasRenderingContext2D} ctx - Contexte
         * @param {number} x - Centre X
         * @param {number} y - Centre Y
         * @param {number} innerRadius - Rayon intérieur
         * @param {number} outerRadius - Rayon extérieur
         * @param {string} colorStart - Couleur de début
         * @param {string} colorEnd - Couleur de fin
         * @returns {CanvasGradient} Dégradé
         */
        createRadialGradient(ctx, x, y, innerRadius, outerRadius, colorStart, colorEnd) {
            const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
            gradient.addColorStop(0, colorStart);
            gradient.addColorStop(1, colorEnd);
            return gradient;
        }
    },

    /**
     * Gestion des entrées clavier/souris
     */
    input: {
        keys: {},
        mouse: { x: 0, y: 0, clicked: false },
        
        /**
         * Initialiser les écouteurs d'événements
         */
        init() {
            window.addEventListener('keydown', (e) => {
                this.keys[e.key.toLowerCase()] = true;
                this.keys[e.code] = true;
            });

            window.addEventListener('keyup', (e) => {
                this.keys[e.key.toLowerCase()] = false;
                this.keys[e.code] = false;
            });

            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            window.addEventListener('mousedown', () => {
                this.mouse.clicked = true;
            });

            window.addEventListener('mouseup', () => {
                this.mouse.clicked = false;
            });
        },

        /**
         * Vérifier si une touche est pressée
         * @param {string} key - Touche à vérifier
         * @returns {boolean} Touche pressée
         */
        isKeyPressed(key) {
            return !!this.keys[key.toLowerCase()];
        },

        /**
         * Réinitialiser les états des touches
         */
        reset() {
            this.keys = {};
            this.mouse.clicked = false;
        }
    },

    /**
     * Système de particules pour les arrière-plans
     */
    particles: {
        particles: [],
        animationId: null,
        
        /**
         * Initialiser les particules sur un canvas
         * @param {HTMLCanvasElement} canvas - Canvas cible
         * @param {Object} options - Options de configuration
         */
        init(canvas, options = {}) {
            const {
                count = 80,
                colors = ['#64b5f6', '#81c784', '#f48fb1', '#ce93d8'],
                minSize = 1,
                maxSize = 3,
                speed = 0.5
            } = options;

            const ctx = canvas.getContext('2d');
            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;

            // Créer les particules
            this.particles = [];
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Utils.random(minSize, maxSize),
                    speedX: Utils.random(-speed, speed),
                    speedY: Utils.random(-speed, speed),
                    color: colors[Math.floor(Math.random() * colors.length)],
                    opacity: Utils.random(0.3, 0.8),
                    twinkleSpeed: Utils.random(0.01, 0.03),
                    twinkleDirection: Math.random() > 0.5 ? 1 : -1
                });
            }

            // Redimensionnement
            window.addEventListener('resize', () => {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            });

            // Animation
            const animate = () => {
                ctx.clearRect(0, 0, width, height);

                this.particles.forEach(p => {
                    // Mouvement
                    p.x += p.speedX;
                    p.y += p.speedY;

                    // Rebondir sur les bords
                    if (p.x < 0 || p.x > width) p.speedX *= -1;
                    if (p.y < 0 || p.y > height) p.speedY *= -1;

                    // Scintillement
                    p.opacity += p.twinkleSpeed * p.twinkleDirection;
                    if (p.opacity >= 0.8 || p.opacity <= 0.3) {
                        p.twinkleDirection *= -1;
                    }

                    // Dessiner
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.opacity;
                    ctx.fill();
                    
                    // Petit halo
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.opacity * 0.2;
                    ctx.fill();
                });

                ctx.globalAlpha = 1;
                this.animationId = requestAnimationFrame(animate);
            };

            animate();
        },

        /**
         * Arrêter l'animation des particules
         */
        stop() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    },

    /**
     * Debounce function
     * @param {Function} func - Fonction à débouncer
     * @param {number} wait - Temps d'attente en ms
     * @returns {Function} Fonction débouncée
     */
    debounce(func, wait = 250) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     * @param {Function} func - Fonction à throttler
     * @param {number} limit - Limite de temps en ms
     * @returns {Function} Fonction throttled
     */
    throttle(func, limit = 100) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Export pour utilisation globale
window.Utils = Utils;
