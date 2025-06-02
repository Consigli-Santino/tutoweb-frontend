import React, { useState, useEffect, useCallback } from 'react';

const BubblePopGame = () => {
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOver, setGameOver] = useState(false);
    const [popEffects, setPopEffects] = useState([]);

    // Colores más vibrantes para las burbujas
    const bubbleColors = [
        { bg: '#4facfe', shadow: '#00f2fe' }, // Azul cielo
        { bg: '#43e97b', shadow: '#38f9d7' }, // Verde menta
        { bg: '#fa709a', shadow: '#fee140' }, // Rosa-amarillo
        { bg: '#a8edea', shadow: '#fed6e3' }, // Aqua
        { bg: '#ffecd2', shadow: '#fcb69f' }, // Durazno
        { bg: '#667eea', shadow: '#764ba2' }, // Púrpura
        { bg: '#f093fb', shadow: '#f5576c' }, // Rosa vibrante
        { bg: '#4facfe', shadow: '#9ba9f7' }, // Azul suave
    ];

    // Generar ID único para cada burbuja
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Crear nueva burbuja con propiedades físicas más realistas
    const createBubble = useCallback(() => {
        const newBubble = {
            id: generateId(),
            x: Math.random() * 75 + 5, // Posición X con margen
            y: Math.random() * 75 + 5, // Posición Y con margen
            size: Math.random() * 25 + 25, // Tamaño entre 25-50px
            color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
            vx: (Math.random() - 0.5) * 3, // Velocidad X más realista
            vy: (Math.random() - 0.5) * 3, // Velocidad Y más realista
            opacity: 0.9,
            points: Math.floor(Math.random() * 50) + 10,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 4,
            scale: 1,
            bounce: 0.8, // Factor de rebote
            gravity: 0.02 // Pequeña gravedad
        };
        return newBubble;
    }, []);

    // Crear efecto de explosión cuando se revienta una burbuja
    const createPopEffect = (x, y, color) => {
        const particles = [];
        for (let i = 0; i < 8; i++) {
            particles.push({
                id: generateId(),
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: color.bg,
                life: 1,
                decay: 0.05
            });
        }
        setPopEffects(prev => [...prev, ...particles]);

        // Limpiar partículas después de un tiempo
        setTimeout(() => {
            setPopEffects(prev => prev.filter(p => !particles.includes(p)));
        }, 1000);
    };

    // Iniciar juego
    const startGame = () => {
        setGameActive(true);
        setGameOver(false);
        setScore(0);
        setTimeLeft(30);
        setBubbles([]);
        setPopEffects([]);
    };

    // Manejar click en burbuja con efecto
    const popBubble = (bubbleId, points, x, y, color) => {
        setBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
        setScore(prev => prev + points);
        createPopEffect(x, y, color);
    };

    // Actualizar física de burbujas con rebotes más realistas
    const updateBubbles = useCallback(() => {
        setBubbles(prev => prev.map(bubble => {
            let newX = bubble.x + bubble.vx;
            let newY = bubble.y + bubble.vy;
            let newVx = bubble.vx;
            let newVy = bubble.vy + bubble.gravity;

            const bubbleRadius = bubble.size / 2;

            // Rebote en paredes izquierda y derecha
            if (newX <= 0 || newX >= (100 - bubble.size * 0.15)) {
                newVx = -newVx * bubble.bounce;
                newX = newX <= 0 ? 0 : (100 - bubble.size * 0.15);
            }

            // Rebote en paredes superior e inferior
            if (newY <= 0 || newY >= (100 - bubble.size * 0.15)) {
                newVy = -newVy * bubble.bounce;
                newY = newY <= 0 ? 0 : (100 - bubble.size * 0.15);
            }

            // Fricción del aire
            newVx *= 0.999;
            newVy *= 0.999;

            return {
                ...bubble,
                x: newX,
                y: newY,
                vx: newVx,
                vy: newVy,
                rotation: bubble.rotation + bubble.rotationSpeed,
                scale: 1 + Math.sin(Date.now() * 0.002 + bubble.id.charCodeAt(0)) * 0.05
            };
        }));
    }, []);

    // Actualizar partículas de efectos
    const updatePopEffects = useCallback(() => {
        setPopEffects(prev => prev.map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vx: particle.vx * 0.95,
            vy: particle.vy * 0.95,
            life: particle.life - particle.decay
        })).filter(particle => particle.life > 0));
    }, []);

    // Añadir burbujas periódicamente
    useEffect(() => {
        if (!gameActive) return;

        const bubbleInterval = setInterval(() => {
            setBubbles(prev => {
                if (prev.length < 10) {
                    return [...prev, createBubble()];
                }
                return prev;
            });
        }, 1200);

        return () => clearInterval(bubbleInterval);
    }, [gameActive, createBubble]);

    // Timer del juego
    useEffect(() => {
        if (!gameActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameActive(false);
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameActive]);

    // Mover burbujas y efectos
    useEffect(() => {
        if (!gameActive) return;

        const moveInterval = setInterval(() => {
            updateBubbles();
            updatePopEffects();
        }, 16); // ~60fps

        return () => clearInterval(moveInterval);
    }, [gameActive, updateBubbles, updatePopEffects]);

    return (
        <div className="container-fluid px-3 py-2">
            <div className="card shadow card-main bubble-game-card">
                <div className="card-header bg-transparent border-0 p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="fw-bold fs-5 mb-0 game-title"  style={{ color: '#283048' }}>
                            <i className="bi bi-balloon me-2 text-primary"></i>
                           ¡A divertirse!
                        </h2>
                        <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-primary fs-6 game-badge">
                                <i className="bi bi-trophy me-1"></i>
                                {score}
                            </span>
                            <span className="badge bg-warning text-dark fs-6 game-badge">
                                <i className="bi bi-clock me-1"></i>
                                {timeLeft}s
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0" style={{ minHeight: '400px' }}>
                    {!gameActive && !gameOver && (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
                            <div className="empty-state">
                                <i className="bi bi-balloon-heart empty-state-icon text-primary floating-icon"></i>
                                <h3 className="fw-bold mb-3">¡Revienta las Burbujas!</h3>
                                <p className="text-muted mb-4 text-center">
                                    Haz clic en las burbujas para reventarlas y ganar puntos.
                                    <br />¡Tienes 30 segundos!
                                </p>
                                <button
                                    className="btn btn-lg text-white fw-bold game-button pulse-button"
                                    style={{ backgroundColor: '#283048' }}
                                    onClick={startGame}
                                >
                                    <i className="bi bi-play-fill me-2"></i>Comenzar Juego
                                </button>
                            </div>
                        </div>
                    )}

                    {gameOver && (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
                            <div className="empty-state">
                                <i className="bi bi-trophy-fill empty-state-icon text-warning bounce-icon"></i>
                                <h3 className="fw-bold mb-3">¡Juego Terminado!</h3>
                                <div className="materia-card text-center mb-4 score-display">
                                    <h2 className="display-4 fw-bold text-primary mb-2 score-number">{score}</h2>
                                    <p className="mb-0">Puntos obtenidos</p>
                                </div>
                                <button
                                    className="btn btn-lg text-white fw-bold game-button pulse-button"
                                    style={{ backgroundColor: '#283048' }}
                                    onClick={startGame}
                                >
                                    <i className="bi bi-arrow-repeat me-2"></i>Jugar de Nuevo
                                </button>
                            </div>
                        </div>
                    )}

                    {gameActive && (
                        <div
                            className="position-relative w-100 overflow-hidden game-area"
                            style={{
                                height: '400px',
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                cursor: 'crosshair'
                            }}
                        >
                            {/* Burbujas */}
                            {bubbles.map(bubble => (
                                <div
                                    key={bubble.id}
                                    className="bubble"
                                    style={{
                                        position: 'absolute',
                                        left: `${bubble.x}%`,
                                        top: `${bubble.y}%`,
                                        width: `${bubble.size}px`,
                                        height: `${bubble.size}px`,
                                        background: `radial-gradient(circle at 30% 30%, ${bubble.color.shadow}, ${bubble.color.bg})`,
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transform: `rotate(${bubble.rotation}deg) scale(${bubble.scale})`,
                                        boxShadow: `0 4px 15px rgba(0,0,0,0.2), inset -2px -2px 10px rgba(255,255,255,0.3)`,
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: `${bubble.size * 0.25}px`,
                                        fontWeight: 'bold',
                                        color: 'white',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                        transition: 'transform 0.1s ease',
                                        zIndex: 10
                                    }}
                                    onClick={() => popBubble(bubble.id, bubble.points, bubble.x, bubble.y, bubble.color)}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = `rotate(${bubble.rotation}deg) scale(${bubble.scale * 1.1})`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = `rotate(${bubble.rotation}deg) scale(${bubble.scale})`;
                                    }}
                                >
                                    {bubble.points}
                                </div>
                            ))}

                            {/* Efectos de partículas */}
                            {popEffects.map(particle => (
                                <div
                                    key={particle.id}
                                    className="particle"
                                    style={{
                                        position: 'absolute',
                                        left: `${particle.x}%`,
                                        top: `${particle.y}%`,
                                        width: '4px',
                                        height: '4px',
                                        backgroundColor: particle.color,
                                        borderRadius: '50%',
                                        opacity: particle.life,
                                        pointerEvents: 'none',
                                        zIndex: 5
                                    }}
                                />
                            ))}

                            {/* Efectos de fondo */}
                            <div className="game-bg-effects"></div>
                        </div>
                    )}
                </div>

                {gameActive && (
                    <div className="card-footer bg-transparent border-0 p-3">
                        <div className="row text-center">
                            <div className="col-4">
                                <small className="text-muted d-block">Burbujas Activas</small>
                                <span className="fw-bold fs-5 text-primary counter-number">{bubbles.length}</span>
                            </div>
                            <div className="col-4">
                                <small className="text-muted d-block">Mejor Burbuja</small>
                                <span className="fw-bold fs-5 text-success counter-number">
                                    {bubbles.length > 0 ? Math.max(...bubbles.map(b => b.points)) : 0}
                                </span>
                            </div>
                            <div className="col-4">
                                <small className="text-muted d-block">Progreso</small>
                                <div className="progress mt-1 game-progress" style={{ height: '8px' }}>
                                    <div
                                        className="progress-bar bg-warning progress-animated"
                                        style={{ width: `${(30 - timeLeft) * 100 / 30}%` }}
                                    ></div>
                                </div>
                                <div className="home-bar-spacing"></div>
                            </div>
                        </div>
                    </div>

                )}
            </div>

            <style jsx>{`
                .bubble-game-card {
                    background: linear-gradient(145deg, #ffffff, #f8f9fa);
                    border: none !important;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }

                .game-title {
                    background: rgba(40, 48, 72, 0.3);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: titleGlow 2s ease-in-out infinite alternate;
                }

                @keyframes titleGlow {
                    from { filter: brightness(1); }
                    to { filter: brightness(1.2); }
                }

                .game-badge {
                    border-radius: 15px;
                    padding: 8px 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    animation: badgePulse 2s ease-in-out infinite;
                }

                @keyframes badgePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                .floating-icon {
                    font-size: 4rem !important;
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }

                .bounce-icon {
                    font-size: 4rem !important;
                    animation: bounce 1s ease-in-out infinite;
                }

                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-20px); }
                    60% { transform: translateY(-10px); }
                }

                .pulse-button {
                    border-radius: 25px;
                    padding: 12px 30px;
                    border: none;
                    box-shadow: 0 6px 20px rgba(40, 48, 72, 0.3);
                    transition: all 0.3s ease;
                    animation: pulseGlow 2s ease-in-out infinite;
                }

                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 6px 20px rgba(40, 48, 72, 0.3); }
                    50% { box-shadow: 0 8px 25px rgba(40, 48, 72, 0.5); }
                }

                .pulse-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(40, 48, 72, 0.4);
                }

                .score-display {
                    background: linear-gradient(145deg, #f8f9fa, #ffffff);
                    border-radius: 20px;
                    padding: 20px;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
                    border: 2px solid rgba(102, 126, 234, 0.2);
                }

                .score-number {
                    animation: scoreGlow 1s ease-in-out;
                }

                @keyframes scoreGlow {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }

                .game-area {
                    position: relative;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 15px;
                }

                .game-bg-effects {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 20% 80%, rgba(40,48,72,0.05) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(40,48,72,0.05) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(40,48,72,0.03) 0%, transparent 50%);
                    pointer-events: none;
                    animation: bgShimmer 4s ease-in-out infinite;
                }

                @keyframes bgShimmer {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }

                .counter-number {
                    display: inline-block;
                    animation: counterPulse 0.5s ease;
                }

                @keyframes counterPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }

                .game-progress {
                    border-radius: 10px;
                    background: rgba(255,255,255,0.2);
                    overflow: hidden;
                }

                .progress-animated {
                    border-radius: 10px;
                    background: linear-gradient(45deg, #ffc107, #fd7e14);
                    animation: progressShine 2s ease-in-out infinite;
                }

                @keyframes progressShine {
                    0% { background-position: -100% 0; }
                    100% { background-position: 100% 0; }
                }

                .bubble {
                    animation: bubbleEntrance 0.5s ease-out;
                }

                @keyframes bubbleEntrance {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }

                .particle {
                    animation: particleExplosion 0.8s ease-out forwards;
                }

                @keyframes particleExplosion {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(0); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default BubblePopGame;