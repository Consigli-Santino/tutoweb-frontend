import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService.js';
import ClassCountdown from "./ClassCountDowns.jsx";
import './BubbleGame.css'; // Importar CSS externo

const BubblePopGame = () => {
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOver, setGameOver] = useState(false);
    const [popEffects, setPopEffects] = useState([]);
    const [showClassAlert, setShowClassAlert] = useState(false);

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

    // Función separada para manejar ClassAlert - EVITA RE-RENDERS
    const handleClassAlert = useCallback((isAlert) => {
        setShowClassAlert(isAlert);
    }, []);

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
    const createPopEffect = useCallback((x, y, color) => {
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
    }, []);

    // Iniciar juego - EVITAR RE-RENDERS DEL COUNTDOWN
    const startGame = useCallback(() => {
        console.log('🎮 Iniciando juego - NO debería afectar ClassCountdown');
        setGameActive(true);
        setGameOver(false);
        setScore(0);
        setTimeLeft(30);
        setBubbles([]);
        setPopEffects([]);
    }, []);

    // Manejar click en burbuja con efecto
    const popBubble = useCallback((bubbleId, points, x, y, color) => {
        setBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
        setScore(prev => prev + points);
        createPopEffect(x, y, color);
    }, [createPopEffect]);

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

    // Añadir burbujas periódicamente - SOLO cuando el juego esté activo
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

    // Timer del juego - INDEPENDIENTE del countdown de clases
    useEffect(() => {
        if (!gameActive) return;

        const gameTimer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameActive(false);
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(gameTimer);
    }, [gameActive]);

    // Mover burbujas y efectos - SOLO cuando el juego esté activo
    useEffect(() => {
        if (!gameActive) return;

        const animationFrame = setInterval(() => {
            updateBubbles();
            updatePopEffects();
        }, 16); // ~60fps

        return () => clearInterval(animationFrame);
    }, [gameActive, updateBubbles, updatePopEffects]);

    return (
        <div className="container-fluid px-2 py-1 bubble-game-container">
            <div className="card shadow card-main bubble-game-card">
                <div className="card-header bg-transparent border-0 p-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <h2 className="fw-bold fs-5 mb-0 game-title">
                            <i className="bi bi-balloon me-2 text-primary"></i>
                            ¡A divertirse!
                        </h2>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
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

                    {/* ClassCountdown se ejecuta independientemente del juego */}
                    <ClassCountdown onClassAlert={handleClassAlert} />
                </div>

                <div className="card-body p-0">
                    {!gameActive && !gameOver && (
                        <div className="d-flex flex-column align-items-center justify-content-center p-3" style={{ minHeight: window.innerWidth <= 767 ? '250px' : '400px' }}>
                            <div className="empty-state text-center">
                                <i className="bi bi-balloon-heart empty-state-icon text-primary floating-icon"></i>
                                <h3 className="fw-bold mb-3">¡Revienta las Burbujas!</h3>
                                <p className="text-muted mb-4 px-2">
                                    Haz clic en las burbujas para reventarlas y ganar puntos.
                                    <br className="d-none d-md-block" />¡Tienes 30 segundos!
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
                        <div className="d-flex flex-column align-items-center justify-content-center p-3" style={{ minHeight: window.innerWidth <= 767 ? '250px' : '400px' }}>
                            <div className="empty-state text-center">
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
                                height: window.innerWidth <= 767 ? '250px' : '400px', // Altura responsiva
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
                        </div>
                    )}
                </div>

                {gameActive && (
                    <div className="card-footer bg-transparent border-0 p-3">
                        <div className="row text-center mt-2">
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