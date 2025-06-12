import React, { useState, useEffect, useCallback, useRef } from 'react';
import ClassCountdown from './ClassCountDowns.jsx';
import GameService from '../../services/GameService';
import FeedbackService from '../../services/FeedbackService';

const BubblePopGame = () => {
    // Estados principales del juego
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOver, setGameOver] = useState(false);
    const [popEffects, setPopEffects] = useState([]);
    const [showClassAlert, setShowClassAlert] = useState(false);

    // Estados de combo y estadísticas
    const [comboCount, setComboCount] = useState(0);
    const [comboTimer, setComboTimer] = useState(null);
    const [showComboMessage, setShowComboMessage] = useState(null);
    const [totalBubblesPopped, setTotalBubblesPopped] = useState(0);
    const [specialBubblesPopped, setSpecialBubblesPopped] = useState(0);
    const [clicks, setClicks] = useState(0);
    const [freezeActive, setFreezeActive] = useState(false);
    const [gameStartTime, setGameStartTime] = useState(null);

    // Estados de configuración
    const [soundEnabled, setSoundEnabled] = useState(FeedbackService.isSoundEnabled());
    const [vibrationEnabled, setVibrationEnabled] = useState(FeedbackService.isVibrationEnabled());

    // Referencias
    const gameAreaRef = useRef(null);
    const animationFrameRef = useRef(null);
    const lastTimeRef = useRef(Date.now());

    // Cargar high score al montar
    useEffect(() => {
        setHighScore(GameService.getHighScore());
    }, []);

    // Función para manejar ClassAlert
    const handleClassAlert = useCallback((isAlert) => {
        setShowClassAlert(isAlert);
    }, []);

    // Crear nueva burbuja
    const createBubble = useCallback(() => {
        return GameService.createBubble();
    }, []);

    // Crear efecto de explosión mejorado
    const createPopEffect = useCallback((x, y, bubble, isCombo = false) => {
        const effectType = bubble.type === GameService.bubbleTypes.BOMB ? 'bomb' :
            bubble.type === GameService.bubbleTypes.FREEZE ? 'freeze' : 'pop';

        const particles = GameService.createParticleEffect(x, y, bubble.color, effectType);

        // Agregar texto de puntos flotante
        const points = isCombo ?
            Math.floor(bubble.points * GameService.calculateComboMultiplier(comboCount).multiplier) :
            bubble.points;

        particles.push({
            id: GameService.generateId(),
            x: x,
            y: y,
            vx: 0,
            vy: -2,
            text: `+${points}`,
            life: 1,
            decay: 0.02,
            isText: true,
            scale: isCombo ? 1.5 : 1,
            color: isCombo ? '#FFD700' : '#283048'
        });

        setPopEffects(prev => [...prev, ...particles]);
    }, [comboCount]);

    // Iniciar juego
    const startGame = useCallback(() => {
        console.log('🎮 Iniciando juego');
        FeedbackService.initializeOnUserInteraction();
        setGameActive(true);
        setGameOver(false);
        setScore(0);
        setTimeLeft(30);
        setBubbles([]);
        setPopEffects([]);
        setComboCount(0);
        setShowComboMessage(null);
        setTotalBubblesPopped(0);
        setSpecialBubblesPopped(0);
        setClicks(0);
        setFreezeActive(false);
        setGameStartTime(Date.now());
        lastTimeRef.current = Date.now();
    }, []);

    // Manejar efectos especiales
    const handleSpecialEffect = useCallback((bubble, x, y) => {
        if (!bubble.specialEffect) return;

        switch (bubble.specialEffect) {
            case 'explodeNearby':
                // Explotar burbujas cercanas
                const nearbyBubbles = GameService.findNearbyBubbles(bubble, bubbles, 20);
                let chainScore = 0;

                nearbyBubbles.forEach(nearbyBubble => {
                    chainScore += nearbyBubble.points;
                    createPopEffect(nearbyBubble.x, nearbyBubble.y, nearbyBubble);
                });

                setBubbles(prev => prev.filter(b => !nearbyBubbles.find(nb => nb.id === b.id)));
                setScore(prev => prev + chainScore);
                setTotalBubblesPopped(prev => prev + nearbyBubbles.length);

                FeedbackService.feedback('bomb');
                break;

            case 'addTime':
                setTimeLeft(prev => Math.min(prev + bubble.timeBonus, 60));
                FeedbackService.feedback('powerup');
                break;

            case 'freezeTime':
                setFreezeActive(true);
                setTimeout(() => setFreezeActive(false), bubble.freezeDuration);
                FeedbackService.feedback('freeze');
                break;

            case 'rainbow':
                // Cambiar todas las burbujas a doradas temporalmente
                setBubbles(prev => prev.map(b => ({
                    ...b,
                    points: b.points * 2,
                    color: { bg: '#FFD700', shadow: '#FFA500' }
                })));
                FeedbackService.feedback('powerup');
                break;
        }
    }, [bubbles, createPopEffect]);

    // Manejar combo
    const handleCombo = useCallback(() => {
        setComboCount(prev => {
            const newCount = prev + 1;

            // Limpiar timer anterior
            if (comboTimer) clearTimeout(comboTimer);

            // Mostrar mensaje de combo
            const { message, multiplier } = GameService.calculateComboMultiplier(newCount);
            if (message && newCount >= 3) {
                setShowComboMessage({ text: message, multiplier });
                FeedbackService.feedback('combo');
            }

            // Establecer nuevo timer
            const newTimer = setTimeout(() => {
                setComboCount(0);
                setShowComboMessage(null);
            }, 1500);
            setComboTimer(newTimer);

            return newCount;
        });
    }, [comboTimer]);

    // Manejar click en burbuja mejorado
    const popBubble = useCallback((bubble) => {
        const comboMultiplier = GameService.calculateComboMultiplier(comboCount).multiplier;
        const points = Math.floor(bubble.points * comboMultiplier);

        setBubbles(prev => prev.filter(b => b.id !== bubble.id));
        setScore(prev => prev + points);
        setTotalBubblesPopped(prev => prev + 1);

        if (bubble.type !== GameService.bubbleTypes.NORMAL) {
            setSpecialBubblesPopped(prev => prev + 1);
        }

        createPopEffect(bubble.x, bubble.y, bubble, comboCount >= 2);
        handleSpecialEffect(bubble, bubble.x, bubble.y);
        handleCombo();

        FeedbackService.feedback('pop');
    }, [comboCount, createPopEffect, handleSpecialEffect, handleCombo]);

    // Detectar click en el área del juego mejorado
    const handleGameAreaClick = useCallback((e) => {
        if (!gameActive) return;

        setClicks(prev => prev + 1);

        const rect = gameAreaRef.current.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;

        // Buscar burbuja clickeada
        let bubbleClicked = false;

        for (const bubble of bubbles) {
            if (GameService.checkBubbleClick(bubble, clickX, clickY)) {
                popBubble(bubble);
                bubbleClicked = true;
                break;
            }
        }

        // Penalización por click fallido
        if (!bubbleClicked) {
            setComboCount(0);
            setShowComboMessage(null);
        }
    }, [gameActive, bubbles, popBubble]);

    // Actualizar física de burbujas
    const updateBubbles = useCallback((deltaTime) => {
        setBubbles(prev => prev.map(bubble =>
            GameService.updateBubblePhysics(bubble, deltaTime)
        ));
    }, []);

    // Actualizar partículas
    const updatePopEffects = useCallback((deltaTime) => {
        setPopEffects(prev => GameService.updateParticles(prev, deltaTime));
    }, []);

    // Loop de animación principal
    const gameLoop = useCallback(() => {
        if (!gameActive) return;

        const currentTime = Date.now();
        const deltaTime = currentTime - lastTimeRef.current;
        lastTimeRef.current = currentTime;

        updateBubbles(deltaTime);
        updatePopEffects(deltaTime);

        animationFrameRef.current = requestAnimationFrame(gameLoop);
    }, [gameActive, updateBubbles, updatePopEffects]);

    // Añadir burbujas periódicamente
    useEffect(() => {
        if (!gameActive) return;

        const bubbleInterval = setInterval(() => {
            setBubbles(prev => {
                const maxBubbles = Math.min(12 + Math.floor(score / 100), 20);
                if (prev.length < maxBubbles) {
                    return [...prev, createBubble()];
                }
                return prev;
            });
        }, 1000 - Math.min(score / 10, 500)); // Aumentar frecuencia con el score

        return () => clearInterval(bubbleInterval);
    }, [gameActive, createBubble, score]);

    // Timer del juego
    useEffect(() => {
        if (!gameActive || freezeActive) return;

        const gameTimer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleGameOver();
                    return 0;
                }

                // Sonido de tick en los últimos 5 segundos
                if (prev <= 5) {
                    FeedbackService.playSound('tick');
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(gameTimer);
    }, [gameActive, freezeActive]);

    // Iniciar loop de animación
    useEffect(() => {
        if (gameActive) {
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameActive, gameLoop]);

    // Limpiar timers al desmontar
    useEffect(() => {
        return () => {
            if (comboTimer) clearTimeout(comboTimer);
        };
    }, [comboTimer]);

    // Manejar fin del juego
    const handleGameOver = useCallback(async () => {
        setGameActive(false);
        setGameOver(true);

        FeedbackService.feedback('gameOver');

        // Calcular estadísticas
        const accuracy = totalBubblesPopped > 0 ?
            Math.round((totalBubblesPopped / clicks) * 100) : 0;

        const gameDuration = Math.round((Date.now() - gameStartTime) / 1000);

        // Preparar datos para guardar
        const scoreData = {
            score,
            combos: comboCount,
            accuracy,
            bubblesPopped: totalBubblesPopped,
            specialBubblesPopped,
            gameDuration
        };

        // Guardar score
        const result = await GameService.saveHighScore(scoreData);

        if (result.newHighScore) {
            setHighScore(score);
        }
    }, [score, comboCount, totalBubblesPopped, specialBubblesPopped, clicks, gameStartTime]);

    // Toggle de configuración
    const toggleSound = () => {
        const newState = FeedbackService.toggleSound();
        setSoundEnabled(newState);
    };

    const toggleVibration = () => {
        const newState = FeedbackService.toggleVibration();
        setVibrationEnabled(newState);
    };

    // Renderizar burbuja según su tipo
    const renderBubble = (bubble) => {
        const isSpecial = bubble.type !== GameService.bubbleTypes.NORMAL;

        return (
            <div
                key={bubble.id}
                className={`bubble ${bubble.type}-bubble`}
                style={{
                    position: 'absolute',
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    background: `radial-gradient(circle at 35% 35%, ${bubble.color.shadow}15, ${bubble.color.bg})`,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transform: `rotate(${bubble.rotation}deg) scale(${bubble.scale})`,
                    boxShadow: isSpecial ?
                        `0 0 ${20 + bubble.glowIntensity * 20}px ${bubble.color.bg}, 0 3px 12px ${bubble.color.shadow}40, inset 0 -3px 8px ${bubble.color.shadow}20` :
                        `0 3px 12px ${bubble.color.shadow}40, inset 0 -3px 8px ${bubble.color.shadow}20`,
                    border: `1px solid ${bubble.color.shadow}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: bubble.icon ? `${bubble.size * 0.4}px` : `${bubble.size * 0.3}px`,
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    zIndex: 10,
                    opacity: bubble.opacity,
                    pointerEvents: 'none',
                    animation: isSpecial ? 'specialBubblePulse 2s ease-in-out infinite' : 'none'
                }}
            >
                {bubble.icon || bubble.points}
            </div>
        );
    };

    // Renderizar partícula
    const renderParticle = (particle) => {
        if (particle.isText) {
            return (
                <div
                    key={particle.id}
                    className="score-popup"
                    style={{
                        position: 'absolute',
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        color: particle.color,
                        fontSize: `${24 * (particle.scale || 1)}px`,
                        fontWeight: 'bold',
                        opacity: particle.life,
                        pointerEvents: 'none',
                        zIndex: 20,
                        transform: 'translate(-50%, -50%)',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    {particle.text}
                </div>
            );
        } else if (particle.type === 'shockwave') {
            return (
                <div
                    key={particle.id}
                    className="shockwave"
                    style={{
                        position: 'absolute',
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size * 2}%`,
                        height: `${particle.size * 2}%`,
                        border: `2px solid ${particle.color}`,
                        borderRadius: '50%',
                        opacity: particle.life * 0.5,
                        pointerEvents: 'none',
                        zIndex: 5,
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            );
        } else if (particle.type === 'crystal') {
            return (
                <div
                    key={particle.id}
                    className="ice-crystal"
                    style={{
                        position: 'absolute',
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        opacity: particle.life * 0.8,
                        pointerEvents: 'none',
                        zIndex: 5,
                        transform: `rotate(${particle.rotation}deg)`,
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                    }}
                />
            );
        } else {
            return (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        position: 'absolute',
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        borderRadius: '50%',
                        opacity: particle.life * 0.8,
                        pointerEvents: 'none',
                        zIndex: 5,
                        boxShadow: `0 0 4px ${particle.color}`
                    }}
                />
            );
        }
    }
    return (
        <div
            ref={gameAreaRef}
            className={`bubble-game-container ${freezeActive ? 'freeze-active' : ''}`}
            onClick={handleGameAreaClick}
            style={{
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
                background: '#E0F7FA',
                borderRadius: '20px'
            }}
        >
            <div className="navbar-spacing"></div>
            {bubbles.map(renderBubble)}
            {popEffects.map(renderParticle)}

            {freezeActive && (
                <div className="freeze-overlay">
                    <div className="snowflake">❄️</div>
                    <div className="snowflake">❄️</div>
                    <div className="snowflake">❄️</div>
                </div>
            )}

            {showComboMessage && (
                <div className="combo-message-container">
                    <div className="combo-message">
                        <div className="combo-text">{showComboMessage.text}</div>
                        <div className="combo-multiplier">x{showComboMessage.multiplier}</div>
                    </div>
                </div>
            )}

            {!gameActive && !gameOver && (
                <button
                    onClick={startGame}
                    className="start-button"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '15px 30px',
                        fontSize: '1.2rem',
                        borderRadius: '10px',
                        backgroundColor: '#00BCD4',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    ¡Jugar!
                </button>
            )}

            {gameOver && (
                <div
                    className="game-over-overlay"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50
                    }}
                >
                    <h2>¡Juego Terminado!</h2>
                    <p>Puntaje: {score}</p>
                    <p>Mejor Puntaje: {highScore}</p>
                    <button
                        onClick={startGame}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            fontSize: '1rem',
                            borderRadius: '8px',
                            backgroundColor: '#00BCD4',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Jugar de nuevo
                    </button>
                </div>
            )}

            <ClassCountdown onClassAlert={handleClassAlert} />
            <div className="home-bar-spacing"></div>
        </div>
    );
};

export default BubblePopGame;