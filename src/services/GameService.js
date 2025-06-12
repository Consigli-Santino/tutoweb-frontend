// services/GameService.js

class GameService {
    constructor() {
        this.bubbleTypes = {
            NORMAL: 'normal',
            GOLDEN: 'golden',
            BOMB: 'bomb',
            TIME: 'time',
            RAINBOW: 'rainbow',
            FREEZE: 'freeze'
        };

        this.bubbleConfig = {
            [this.bubbleTypes.NORMAL]: {
                probability: 0.7,
                pointsMultiplier: 1,
                minPoints: 10,
                maxPoints: 50,
                colors: [
                    { bg: '#7C9DBF', shadow: '#5A7A9B' },
                    { bg: '#9BB89D', shadow: '#7A967C' },
                    { bg: '#D4A5A5', shadow: '#B08585' },
                    { bg: '#C7CEEA', shadow: '#A5ADCB' },
                    { bg: '#FFD8B5', shadow: '#E5B896' },
                    { bg: '#B8B8D1', shadow: '#9696AF' },
                    { bg: '#FABB9B', shadow: '#D89A7B' },
                    { bg: '#A8DADC', shadow: '#87B9BB' },
                ]
            },
            [this.bubbleTypes.GOLDEN]: {
                probability: 0.15,
                pointsMultiplier: 5,
                minPoints: 50,
                maxPoints: 100,
                colors: [{ bg: '#FFD700', shadow: '#FFA500' }],
                icon: '⭐'
            },
            [this.bubbleTypes.BOMB]: {
                probability: 0.05,
                pointsMultiplier: 2,
                minPoints: 30,
                maxPoints: 60,
                colors: [{ bg: '#FF6B6B', shadow: '#DC143C' }],
                icon: '💣',
                specialEffect: 'explodeNearby'
            },
            [this.bubbleTypes.TIME]: {
                probability: 0.05,
                pointsMultiplier: 1,
                minPoints: 20,
                maxPoints: 40,
                colors: [{ bg: '#4ECDC4', shadow: '#45B7B8' }],
                icon: '⏱️',
                specialEffect: 'addTime',
                timeBonus: 5
            },
            [this.bubbleTypes.RAINBOW]: {
                probability: 0.03,
                pointsMultiplier: 3,
                minPoints: 40,
                maxPoints: 80,
                colors: [{ bg: '#FF6B6B', shadow: '#FF5252' }],
                icon: '🌈',
                specialEffect: 'rainbow'
            },
            [this.bubbleTypes.FREEZE]: {
                probability: 0.02,
                pointsMultiplier: 1,
                minPoints: 30,
                maxPoints: 50,
                colors: [{ bg: '#74C0FC', shadow: '#339AF0' }],
                icon: '❄️',
                specialEffect: 'freezeTime',
                freezeDuration: 3000
            }
        };

        this.comboThresholds = [
            { count: 3, multiplier: 1.5, message: '¡Combo x3!' },
            { count: 5, multiplier: 2, message: '¡Súper Combo!' },
            { count: 8, multiplier: 3, message: '¡Mega Combo!' },
            { count: 12, multiplier: 5, message: '¡ULTRA COMBO!' },
            { count: 20, multiplier: 10, message: '¡¡LEGENDARIO!!' }
        ];
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    determineBubbleType() {
        const random = Math.random();
        let cumulativeProbability = 0;

        for (const [type, config] of Object.entries(this.bubbleConfig)) {
            cumulativeProbability += config.probability;
            if (random <= cumulativeProbability) {
                return type;
            }
        }

        return this.bubbleTypes.NORMAL;
    }

    createBubble() {
        const type = this.determineBubbleType();
        const config = this.bubbleConfig[type];
        const colorSet = config.colors[Math.floor(Math.random() * config.colors.length)];

        const bubble = {
            id: this.generateId(),
            type: type,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            size: type === this.bubbleTypes.GOLDEN ? 50 : Math.random() * 30 + 35,
            color: colorSet,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            opacity: type === this.bubbleTypes.GOLDEN ? 1 : 0.85,
            points: Math.floor(Math.random() * (config.maxPoints - config.minPoints) + config.minPoints),
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            scale: 1,
            bounce: 0.7,
            gravity: 0.015,
            clickRadius: 1.5,
            icon: config.icon || null,
            specialEffect: config.specialEffect || null,
            timeBonus: config.timeBonus || 0,
            freezeDuration: config.freezeDuration || 0,
            pulsePhase: Math.random() * Math.PI * 2,
            glowIntensity: type === this.bubbleTypes.GOLDEN ? 1 : 0
        };

        return bubble;
    }

    updateBubblePhysics(bubble, deltaTime = 16) {
        const timeScale = deltaTime / 16;

        let newX = bubble.x + bubble.vx * timeScale;
        let newY = bubble.y + bubble.vy * timeScale;
        let newVx = bubble.vx;
        let newVy = bubble.vy + bubble.gravity * timeScale;

        // Rebote suave en paredes
        if (newX <= 0 || newX >= (100 - bubble.size * 0.15)) {
            newVx = -newVx * bubble.bounce;
            newX = newX <= 0 ? 0 : (100 - bubble.size * 0.15);
        }

        if (newY <= 0 || newY >= (100 - bubble.size * 0.15)) {
            newVy = -newVy * bubble.bounce;
            newY = newY <= 0 ? 0 : (100 - bubble.size * 0.15);
        }

        // Fricción del aire
        newVx *= 0.998;
        newVy *= 0.998;

        // Efectos especiales según el tipo
        const time = Date.now() * 0.001;
        let scaleEffect = 1;
        let glowEffect = bubble.glowIntensity || 0;

        if (bubble.type === this.bubbleTypes.GOLDEN) {
            scaleEffect = 1 + Math.sin(time * 3 + bubble.pulsePhase) * 0.1;
            glowEffect = 0.5 + Math.sin(time * 2) * 0.5;
        } else if (bubble.type === this.bubbleTypes.RAINBOW) {
            bubble.rotation += bubble.rotationSpeed * 2;
        } else if (bubble.type === this.bubbleTypes.FREEZE) {
            scaleEffect = 1 + Math.sin(time * 2 + bubble.pulsePhase) * 0.05;
        } else {
            // Movimiento ondulatorio sutil para burbujas normales
            const wobble = Math.sin(time + bubble.pulsePhase) * 0.02;
            scaleEffect = 1 + wobble;
        }

        return {
            ...bubble,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: bubble.rotation + bubble.rotationSpeed * timeScale,
            scale: scaleEffect,
            glowIntensity: glowEffect
        };
    }

    checkBubbleClick(bubble, clickX, clickY) {
        const bubbleRadius = (bubble.size * bubble.clickRadius) / 2;
        const bubbleCenterX = bubble.x + bubble.size * 0.075;
        const bubbleCenterY = bubble.y + bubble.size * 0.075;

        const distance = Math.sqrt(
            Math.pow(clickX - bubbleCenterX, 2) +
            Math.pow(clickY - bubbleCenterY, 2)
        );

        return distance <= bubbleRadius * 0.15;
    }

    findNearbyBubbles(targetBubble, allBubbles, radius = 15) {
        return allBubbles.filter(bubble => {
            if (bubble.id === targetBubble.id) return false;

            const distance = Math.sqrt(
                Math.pow(bubble.x - targetBubble.x, 2) +
                Math.pow(bubble.y - targetBubble.y, 2)
            );

            return distance <= radius;
        });
    }

    calculateComboMultiplier(comboCount) {
        let multiplier = 1;
        let message = '';

        for (const threshold of this.comboThresholds.reverse()) {
            if (comboCount >= threshold.count) {
                multiplier = threshold.multiplier;
                message = threshold.message;
                break;
            }
        }

        return { multiplier, message };
    }

    createParticleEffect(x, y, color, type = 'pop') {
        const particles = [];

        if (type === 'pop') {
            for (let i = 0; i < 12; i++) {
                particles.push({
                    id: this.generateId(),
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10 - 2,
                    color: color.bg,
                    life: 1,
                    decay: 0.03,
                    size: Math.random() * 6 + 2,
                    type: 'particle'
                });
            }
        } else if (type === 'bomb') {
            // Efecto de onda expansiva
            particles.push({
                id: this.generateId(),
                x: x,
                y: y,
                size: 0,
                maxSize: 30,
                life: 1,
                decay: 0.05,
                type: 'shockwave',
                color: color.bg
            });

            // Más partículas para explosión
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                const speed = 8 + Math.random() * 4;
                particles.push({
                    id: this.generateId(),
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: color.bg,
                    life: 1,
                    decay: 0.02,
                    size: Math.random() * 8 + 4,
                    type: 'particle'
                });
            }
        } else if (type === 'freeze') {
            // Cristales de hielo
            for (let i = 0; i < 8; i++) {
                particles.push({
                    id: this.generateId(),
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: -Math.random() * 3 - 1,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 10,
                    color: '#74C0FC',
                    life: 1,
                    decay: 0.02,
                    size: Math.random() * 10 + 5,
                    type: 'crystal'
                });
            }
        }

        return particles;
    }

    updateParticles(particles, deltaTime = 16) {
        const timeScale = deltaTime / 16;

        return particles.map(particle => {
            if (particle.type === 'shockwave') {
                const newSize = particle.size + (particle.maxSize - particle.size) * 0.3 * timeScale;
                return {
                    ...particle,
                    size: newSize,
                    life: particle.life - particle.decay * timeScale
                };
            } else if (particle.type === 'crystal') {
                return {
                    ...particle,
                    x: particle.x + particle.vx * timeScale,
                    y: particle.y + particle.vy * timeScale,
                    vy: particle.vy + 0.1 * timeScale,
                    rotation: particle.rotation + particle.rotationSpeed * timeScale,
                    life: particle.life - particle.decay * timeScale
                };
            } else {
                return {
                    ...particle,
                    x: particle.x + particle.vx * timeScale,
                    y: particle.y + particle.vy * timeScale,
                    vx: particle.vx * 0.92,
                    vy: particle.vy * 0.92 + 0.2 * timeScale,
                    life: particle.life - particle.decay * timeScale
                };
            }
        }).filter(particle => particle.life > 0);
    }

    // Método preparado para guardar score
    async saveHighScore(scoreData) {
        // Estructura preparada para el backend
        const payload = {
            score: scoreData.score,
            combos: scoreData.combos,
            accuracy: scoreData.accuracy,
            bubblesPopped: scoreData.bubblesPopped,
            specialBubblesPopped: scoreData.specialBubblesPopped,
            gameMode: scoreData.gameMode || 'normal',
            gameDuration: scoreData.gameDuration,
            timestamp: new Date().toISOString()
        };

        // TODO: Implementar llamada al backend
        console.log('Score listo para guardar:', payload);

        // Por ahora, guardar localmente
        const currentHighScore = localStorage.getItem('bubbleGameHighScore');
        if (!currentHighScore || scoreData.score > parseInt(currentHighScore)) {
            localStorage.setItem('bubbleGameHighScore', scoreData.score.toString());
            localStorage.setItem('bubbleGameStats', JSON.stringify(payload));
            return { success: true, newHighScore: true };
        }

        return { success: true, newHighScore: false };
    }

    getHighScore() {
        return parseInt(localStorage.getItem('bubbleGameHighScore') || '0');
    }

    getGameStats() {
        const stats = localStorage.getItem('bubbleGameStats');
        return stats ? JSON.parse(stats) : null;
    }
}

export default new GameService();