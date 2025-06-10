import React, { useState, useEffect, useCallback } from 'react';
import ClassCountdown from './ClassCountDowns.jsx';

const BubblePopGame = () => {
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOver, setGameOver] = useState(false);
    const [popEffects, setPopEffects] = useState([]);
    const [showClassAlert, setShowClassAlert] = useState(false);

    // Colores mate más suaves y modernos
    const bubbleColors = [
        { bg: '#7C9DBF', shadow: '#5A7A9B' }, // Azul grisáceo mate
        { bg: '#9BB89D', shadow: '#7A967C' }, // Verde salvia mate
        { bg: '#D4A5A5', shadow: '#B08585' }, // Rosa polvo mate
        { bg: '#C7CEEA', shadow: '#A5ADCB' }, // Lavanda suave mate
        { bg: '#FFD8B5', shadow: '#E5B896' }, // Melocotón mate
        { bg: '#B8B8D1', shadow: '#9696AF' }, // Lila grisáceo mate
        { bg: '#FABB9B', shadow: '#D89A7B' }, // Coral suave mate
        { bg: '#A8DADC', shadow: '#87B9BB' }, // Turquesa pálido mate
    ];

    // Generar ID único para cada burbuja
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Función separada para manejar ClassAlert
    const handleClassAlert = useCallback((isAlert) => {
        setShowClassAlert(isAlert);
    }, []);

    // Crear nueva burbuja con propiedades mejoradas
    const createBubble = useCallback(() => {
        const newBubble = {
            id: generateId(),
            x: Math.random() * 80 + 10, // Mejor distribución
            y: Math.random() * 80 + 10,
            size: Math.random() * 30 + 35, // Tamaño entre 35-65px
            color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
            vx: (Math.random() - 0.5) * 2, // Velocidad más suave
            vy: (Math.random() - 0.5) * 2,
            opacity: 0.85,
            points: Math.floor(Math.random() * 50) + 10,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            scale: 1,
            bounce: 0.7,
            gravity: 0.015,
            clickRadius: 1.3 // Factor de área clickeable más grande
        };
        return newBubble;
    }, []);

    // Crear efecto de explosión mejorado
    const createPopEffect = useCallback((x, y, color, points) => {
        const particles = [];
        // Más partículas para mejor efecto
        for (let i = 0; i < 12; i++) {
            particles.push({
                id: generateId(),
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 2, // Tendencia hacia arriba
                color: color.bg,
                life: 1,
                decay: 0.03,
                size: Math.random() * 6 + 2
            });
        }

        // Agregar texto de puntos flotante
        particles.push({
            id: generateId(),
            x: x,
            y: y,
            vx: 0,
            vy: -2,
            text: `+${points}`,
            life: 1,
            decay: 0.02,
            isText: true
        });

        setPopEffects(prev => [...prev, ...particles]);

        setTimeout(() => {
            setPopEffects(prev => prev.filter(p => !particles.includes(p)));
        }, 1500);
    }, []);

    // Iniciar juego
    const startGame = useCallback(() => {
        console.log('🎮 Iniciando juego');
        setGameActive(true);
        setGameOver(false);
        setScore(0);
        setTimeLeft(30);
        setBubbles([]);
        setPopEffects([]);
    }, []);

    // Manejar click en burbuja con área de click mejorada
    const popBubble = useCallback((bubbleId, points, x, y, color) => {
        setBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
        setScore(prev => prev + points);
        createPopEffect(x, y, color, points);

        // Vibración suave en móviles (si está disponible)
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(20);
        }
    }, [createPopEffect]);

    // Detectar click en el área del juego
    const handleGameAreaClick = useCallback((e) => {
        if (!gameActive) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;

        // Verificar si el click está cerca de alguna burbuja
        bubbles.forEach(bubble => {
            const bubbleRadius = (bubble.size * bubble.clickRadius) / 2;
            const distance = Math.sqrt(
                Math.pow(clickX - (bubble.x + bubble.size * 0.075), 2) +
                Math.pow(clickY - (bubble.y + bubble.size * 0.075), 2)
            );

            // Área de click más generosa
            if (distance <= bubbleRadius * 0.15) {
                popBubble(bubble.id, bubble.points, bubble.x, bubble.y, bubble.color);
            }
        });
    }, [gameActive, bubbles, popBubble]);

    // Actualizar física de burbujas con movimiento más suave
    const updateBubbles = useCallback(() => {
        setBubbles(prev => prev.map(bubble => {
            let newX = bubble.x + bubble.vx;
            let newY = bubble.y + bubble.vy;
            let newVx = bubble.vx;
            let newVy = bubble.vy + bubble.gravity;

            // Rebote suave en paredes
            if (newX <= 0 || newX >= (100 - bubble.size * 0.15)) {
                newVx = -newVx * bubble.bounce;
                newX = newX <= 0 ? 0 : (100 - bubble.size * 0.15);
            }

            if (newY <= 0 || newY >= (100 - bubble.size * 0.15)) {
                newVy = -newVy * bubble.bounce;
                newY = newY <= 0 ? 0 : (100 - bubble.size * 0.15);
            }

            // Fricción del aire más suave
            newVx *= 0.998;
            newVy *= 0.998;

            // Movimiento ondulatorio sutil
            const wobble = Math.sin(Date.now() * 0.001 + bubble.id.charCodeAt(0)) * 0.02;

            return {
                ...bubble,
                x: newX,
                y: newY,
                vx: newVx,
                vy: newVy,
                rotation: bubble.rotation + bubble.rotationSpeed,
                scale: 1 + wobble
            };
        }));
    }, []);

    // Actualizar partículas de efectos
    const updatePopEffects = useCallback(() => {
        setPopEffects(prev => prev.map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vx: particle.vx * 0.92,
            vy: particle.vy * 0.92 + 0.2, // Gravedad para partículas
            life: particle.life - particle.decay
        })).filter(particle => particle.life > 0));
    }, []);

    // Añadir burbujas periódicamente
    useEffect(() => {
        if (!gameActive) return;

        const bubbleInterval = setInterval(() => {
            setBubbles(prev => {
                if (prev.length < 12) { // Más burbujas para mejor jugabilidad
                    return [...prev, createBubble()];
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(bubbleInterval);
    }, [gameActive, createBubble]);

    // Timer del juego
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

    // Mover burbujas y efectos
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
            <div className="card shadow card-main bubble-game-card" style={{ borderRadius: '20px', overflow: 'hidden' }}>
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
                                    style={{ backgroundColor: '#283048', borderRadius: '25px' }}
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
                            className="position-relative w-100 overflow-hidden game-area"
                            onClick={handleGameAreaClick}
                            style={{
                                height: window.innerWidth <= 767 ? '250px' : '400px',
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%)',
                                cursor: 'crosshair',
                                borderRadius: '0'
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
                                        background: `radial-gradient(circle at 35% 35%, ${bubble.color.shadow}15, ${bubble.color.bg})`,
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transform: `rotate(${bubble.rotation}deg) scale(${bubble.scale})`,
                                        boxShadow: `0 3px 12px ${bubble.color.shadow}40, inset 0 -3px 8px ${bubble.color.shadow}20`,
                                        border: `1px solid ${bubble.color.shadow}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: `${bubble.size * 0.3}px`,
                                        fontWeight: 'bold',
                                        color: 'white',
                                        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                        zIndex: 10,
                                        opacity: bubble.opacity,
                                        transition: 'transform 0.1s ease-out',
                                        pointerEvents: 'none' // Deshabilitamos eventos aquí para usar el área de juego
                                    }}
                                >
                                    {bubble.points}
                                </div>
                            ))}

                            {/* Efectos de partículas */}
                            {popEffects.map(particle => (
                                particle.isText ? (
                                    <div
                                        key={particle.id}
                                        style={{
                                            position: 'absolute',
                                            left: `${particle.x}%`,
                                            top: `${particle.y}%`,
                                            color: '#283048',
                                            fontSize: '24px',
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
                                ) : (
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
                                )
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