// services/FeedbackService.js

class FeedbackService {
    constructor() {
        this.soundEnabled = localStorage.getItem('bubbleGameSound') !== 'false';
        this.vibrationEnabled = localStorage.getItem('bubbleGameVibration') !== 'false';
        this.audioContext = null;
        this.sounds = {};
        this.initializeAudio();
    }

    initializeAudio() {
        // Crear AudioContext cuando el usuario interactúe por primera vez
        if (typeof window !== 'undefined' && window.AudioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        }
    }

    createSounds() {
        if (!this.audioContext) return;

        // Crear sonidos sintéticos simples
        this.sounds = {
            pop: this.createPopSound(),
            combo: this.createComboSound(),
            powerup: this.createPowerupSound(),
            bomb: this.createBombSound(),
            freeze: this.createFreezeSound(),
            gameOver: this.createGameOverSound(),
            tick: this.createTickSound()
        };
    }

    createPopSound() {
        return () => {
            if (!this.audioContext || !this.soundEnabled) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    createComboSound() {
        return () => {
            if (!this.audioContext || !this.soundEnabled) return;

            const notes = [523.25, 659.25, 783.99]; // C, E, G

            notes.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.05);

                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + index * 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.05 + 0.2);

                oscillator.start(this.audioContext.currentTime + index * 0.05);
                oscillator.stop(this.audioContext.currentTime + index * 0.05 + 0.2);
            });
        };
    }

    createPowerupSound() {
        return () => {
            if (!this.audioContext || !this.soundEnabled) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.3);

            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createBombSound() {
        return () => {
            if (!this.audioContext || !this.soundEnabled) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(100, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.5);

            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
    }

    createFreezeSound() {
        return () => {
            if (!this.audioContext || !this.soundEnabled) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);

            oscillator.frequency.setValueAtTime(4000, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(3000, this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(4000, this.audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createGameOverSound() {
        return () => {
            if (!this.audioContext || !this.soundEnabled) return;

            const notes = [392, 349.23, 329.63, 293.66]; // G, F, E, D

            notes.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.15);

                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + index * 0.15);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.15 + 0.3);

                oscillator.start(this.audioContext.currentTime + index * 0.15);
                oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.3);
            });
        };
    }

    createTickSound() {
        return () => {
            if (!this.audioContext || !this.soundEnabled) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        };
    }

    playSound(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;

        try {
            this.sounds[soundName]();
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }

    vibrate(pattern = 20) {
        if (!this.vibrationEnabled) return;

        if (window.navigator && window.navigator.vibrate) {
            try {
                window.navigator.vibrate(pattern);
            } catch (error) {
                console.warn('Vibration not supported:', error);
            }
        }
    }

    // Patrones de vibración específicos
    vibratePattern(type) {
        if (!this.vibrationEnabled) return;

        const patterns = {
            pop: 20,
            combo: [20, 50, 20],
            powerup: [50, 30, 50, 30, 100],
            bomb: [100, 50, 200],
            freeze: [30, 30, 30, 30, 30],
            gameOver: [200, 100, 200]
        };

        this.vibrate(patterns[type] || 20);
    }

    // Feedback completo (sonido + vibración)
    feedback(type) {
        this.playSound(type);
        this.vibratePattern(type);
    }

    // Toggle settings
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('bubbleGameSound', this.soundEnabled.toString());
        return this.soundEnabled;
    }

    toggleVibration() {
        this.vibrationEnabled = !this.vibrationEnabled;
        localStorage.setItem('bubbleGameVibration', this.vibrationEnabled.toString());
        return this.vibrationEnabled;
    }

    isSoundEnabled() {
        return this.soundEnabled;
    }

    isVibrationEnabled() {
        return this.vibrationEnabled;
    }

    // Inicializar audio context con interacción del usuario
    initializeOnUserInteraction() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        } else if (!this.audioContext) {
            this.initializeAudio();
        }
    }
}

export default new FeedbackService();