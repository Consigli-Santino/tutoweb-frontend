import React, { useState, useEffect, useCallback, useRef } from 'react';
import ClassCountdown from './ClassCountDowns.jsx';
import GameService from '../../services/GameService';
import FeedbackService from '../../services/FeedBackService';

const BubblePopGame = () => {
    // Estados principales del juego
    const feedbackService = new FeedbackService();
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
    const [soundEnabled, setSoundEnabled] = useState(feedbackService.isSoundEnabled());
    const [vibrationEnabled, setVibrationEnabled] = useState(feedbackService.isVibrationEnabled());

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
        feedbackService.initializeOnUserInteraction();
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

                feedbackService.feedback('bomb');
                break;

            case 'addTime':
                setTimeLeft(prev => Math.min(prev + bubble.timeBonus, 60));
                feedbackService.feedback('powerup');
                break;

            case 'freezeTime':
                setFreezeActive(true);
                setTimeout(() => setFreezeActive(false), bubble.freezeDuration);
                feedbackService.feedback('freeze');
                break;

            case 'rainbow':
                // Cambiar todas las burbujas a doradas temporalmente
                setBubbles(prev => prev.map(b => ({
                    ...b,
                    points: b.points * 2,
                    color: { bg: '#FFD700', shadow: '#FFA500' }
                })));
                feedbackService.feedback('powerup');
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

        feedbackService.feedback('pop');
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
                    feedbackService.playSound('tick');
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

        feedbackService.feedback('gameOver');

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
        const newState = feedbackService.toggleSound();
        setSoundEnabled(newState);
    };

    const toggleVibration = () => {
        const newState = feedbackService.toggleVibration();
        setVibrationEnabled(newState);
    };

    // Renderizar burbuja según su tipo con efecto 3D mejorado
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
                    background: `radial-gradient(circle at 30% 30%, ${bubble.color.bg}ee, ${bubble.color.shadow}dd)`,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transform: `translate3d(0, 0, 0) rotate(${bubble.rotation}deg) scale(${bubble.scale})`,
                    boxShadow: isSpecial ?
                        `inset -${bubble.size * 0.15}px -${bubble.size * 0.15}px ${bubble.size * 0.3}px ${bubble.color.shadow}aa,
                         inset ${bubble.size * 0.1}px ${bubble.size * 0.1}px ${bubble.size * 0.2}px rgba(255,255,255,0.5),
                         0 ${bubble.size * 0.1}px ${bubble.size * 0.2}px ${bubble.color.shadow}66,
                         0 0 ${20 + bubble.glowIntensity * 20}px ${bubble.color.bg}` :
                        `inset -${bubble.size * 0.15}px -${bubble.size * 0.15}px ${bubble.size * 0.3}px ${bubble.color.shadow}aa,
                         inset ${bubble.size * 0.1}px ${bubble.size * 0.1}px ${bubble.size * 0.2}px rgba(255,255,255,0.5),
                         0 ${bubble.size * 0.1}px ${bubble.size * 0.2}px ${bubble.color.shadow}66`,
                    border: `2px solid ${bubble.color.bg}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: bubble.icon ? `${bubble.size * 0.4}px` : `${bubble.size * 0.3}px`,
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    zIndex: 10,
                    opacity: bubble.opacity,
                    pointerEvents: 'none',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden'
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
    };

    return (
        <div className="container-fluid px-2 py-1 bubble-game-container">
            <div className="card shadow card-main bubble-game-card" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <div className="card-header bg-transparent border-0 p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <h1 className="fw-bold fs-4 mb-0 game-title">
                            <i className="bi bi-balloon me-2 text-primary"></i>
                            ¡A divertirse!
                        </h1>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="badge bg-primary fs-6 game-badge">
                                <i className="bi bi-trophy me-1"></i>
                                {score}
                            </span>
                            {highScore > 0 && (
                                <span className="badge bg-success fs-6 game-badge">
                                    <i className="bi bi-star me-1"></i>
                                    {highScore}
                                </span>
                            )}
                            <span className={`badge ${freezeActive ? 'bg-info' : 'bg-warning text-dark'} fs-6 game-badge`}>
                                <i className="bi bi-clock me-1"></i>
                                {timeLeft}s
                            </span>
                            <div className="btn-group btn-group-sm" role="group">
                                <button
                                    className={`btn ${soundEnabled ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={toggleSound}
                                    title="Sonido"
                                >
                                    <i className={`bi ${soundEnabled ? 'bi-volume-up' : 'bi-volume-mute'}`}></i>
                                </button>
                                <button
                                    className={`btn ${vibrationEnabled ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={toggleVibration}
                                    title="Vibración"
                                >
                                    <i className="bi bi-phone-vibrate"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <ClassCountdown onClassAlert={handleClassAlert} />

                    {/* Mensaje de combo */}
                    {showComboMessage && (
                        <div className="combo-message-container">
                            <div className="combo-message animate__animated animate__bounceIn">
                                <div className="combo-text">{showComboMessage.text}</div>
                                <div className="combo-multiplier">x{showComboMessage.multiplier}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="card-body p-0">
                    {!gameActive && !gameOver && (
                        <div className="d-flex flex-column align-items-center justify-content-center p-3" style={{ minHeight: window.innerWidth <= 767 ? '250px' : '400px' }}>
                            <div className="empty-state text-center">
                                <i className="bi bi-balloon-heart empty-state-icon text-primary floating-icon"></i>
                                <h3 className="fw-bold mb-3">¡Revienta las Burbujas!</h3>
                                <p className="text-muted mb-4 px-2">
                                    Haz clic en las burbujas para reventarlas y ganar puntos.
                                    <br className="d-none d-md-block" />
                                    <span className="text-warning fw-bold">⭐ Doradas = x5 puntos</span> •
                                    <span className="text-danger fw-bold"> 💣 Bombas = Explosión</span> •
                                    <span className="text-info fw-bold"> ⏱️ Tiempo = +5s</span>
                                    <br className="d-none d-md-block" />¡Tienes 30 segundos!
                                </p>
                                <button
                                    className="btn btn-lg text-white fw-bold game-button pulse-button"
                                    style={{ backgroundColor: '#283048', borderRadius: '25px' }}
                                    onClick={startGame}
                                >
                                    <i className="bi bi-play-fill me-2"></i>Comenzar Juego
                                </button>
                                {highScore > 0 && (
                                    <div className="mt-3">
                                        <small className="text-muted">Mejor puntuación: <span className="fw-bold text-primary">{highScore}</span></small>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {gameOver && (
                        <div className="d-flex flex-column align-items-center justify-content-center p-3" style={{ minHeight: window.innerWidth <= 767 ? '250px' : '400px' }}>
                            <div className="empty-state text-center">
                                <i className="bi bi-trophy-fill empty-state-icon text-warning bounce-icon"></i>
                                <h3 className="fw-bold mb-3">¡Juego Terminado!</h3>
                                <div className="materia-card text-center mb-4 score-display">
                                    <h2 className="display-4 fw-bold text-primary mb-2 score-number">{score}</h2>
                                    <p className="mb-0">Puntos obtenidos</p>
                                    {score > highScore && (
                                        <div className="badge bg-success mt-2">
                                            <i className="bi bi-star-fill me-1"></i>
                                            ¡Nuevo récord!
                                        </div>
                                    )}
                                </div>
                                <div className="stats-grid mb-3">
                                    <div className="stat-item">
                                        <i className="bi bi-bullseye text-primary"></i>
                                        <div className="stat-value">{totalBubblesPopped > 0 ? Math.round((totalBubblesPopped / clicks) * 100) : 0}%</div>
                                        <div className="stat-label">Precisión</div>
                                    </div>
                                    <div className="stat-item">
                                        <i className="bi bi-balloon text-success"></i>
                                        <div className="stat-value">{totalBubblesPopped}</div>
                                        <div className="stat-label">Burbujas</div>
                                    </div>
                                    <div className="stat-item">
                                        <i className="bi bi-star text-warning"></i>
                                        <div className="stat-value">{specialBubblesPopped}</div>
                                        <div className="stat-label">Especiales</div>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-lg text-white fw-bold game-button pulse-button"
                                    style={{ backgroundColor: '#283048', borderRadius: '25px' }}
                                    onClick={startGame}
                                >
                                    <i className="bi bi-arrow-repeat me-2"></i>Jugar de Nuevo
                                </button>
                            </div>
                        </div>
                    )}

                    {gameActive && (
                        <div
                            ref={gameAreaRef}
                            className={`position-relative w-100 overflow-hidden game-area ${freezeActive ? 'freeze-active' : ''}`}
                            onClick={handleGameAreaClick}
                            style={{
                                height: window.innerWidth <= 767 ? '250px' : '400px',
                                background: freezeActive ?
                                    'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' :
                                    'linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%)',
                                cursor: 'crosshair',
                                borderRadius: '0',
                                transition: 'background 0.3s ease'
                            }}
                        >
                            {/* Efecto de congelamiento */}
                            {freezeActive && (
                                <div className="freeze-overlay">
                                    <div className="snowflake">❄️</div>
                                    <div className="snowflake">❄️</div>
                                    <div className="snowflake">❄️</div>
                                </div>
                            )}

                            {/* Burbujas */}
                            {bubbles.map(renderBubble)}

                            {/* Efectos de partículas */}
                            {popEffects.map(renderParticle)}
                        </div>
                    )}
                </div>

                {gameActive && (
                    <div className="card-footer bg-transparent border-0 p-3">
                        <div className="row text-center mt-2">
                            <div className="col-4">
                                <small className="text-muted d-block">Combo</small>
                                <span className={`fw-bold fs-5 ${comboCount >= 3 ? 'text-warning' : 'text-primary'} counter-number`}>
                                    {comboCount > 0 ? `x${comboCount}` : '-'}
                                </span>
                            </div>
                            <div className="col-4">
                                <small className="text-muted d-block">Precisión</small>
                                <span className="fw-bold fs-5 text-success counter-number">
                                    {clicks > 0 ? Math.round((totalBubblesPopped / clicks) * 100) : 100}%
                                </span>
                            </div>
                            <div className="col-4">
                                <small className="text-muted d-block">Progreso</small>
                                <div className="progress mt-1 game-progress" style={{ height: '8px', borderRadius: '10px' }}>
                                    <div
                                        className="progress-bar bg-warning progress-animated"
                                        style={{ width: `${(30 - timeLeft) * 100 / 30}%`, borderRadius: '10px' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Espaciado para HomeBar en mobile */}
            <div className="home-bar-spacing"></div>
        </div>
    );
};

export default BubblePopGame;