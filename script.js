// --- Canvas Floating Rockets Animation ---
const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');

let width, height;
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Rocket particle class based on Blue Launch logo styling
class RocketParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 100;
        this.speed = 1.5 + Math.random() * 2.5;
        this.scale = 0.5 + Math.random() * 0.7;
        this.opacity = 0.2 + Math.random() * 0.7;
        this.trail = [];
    }

    update() {
        this.y -= this.speed;
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 15) this.trail.shift();

        if (this.y < -50) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Draw Thrust Trail
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
            ctx.lineWidth = 3 * this.scale;
            ctx.stroke();
        }

        // Draw Stylized Rocket (Circuit Node Rocket from logo)
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // Rocket Body
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(8, 0);
        ctx.lineTo(8, 15);
        ctx.lineTo(-8, 15);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fill();

        // Wings / Fins
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.moveTo(-8, 5);
        ctx.lineTo(-14, 18);
        ctx.lineTo(-8, 15);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(8, 5);
        ctx.lineTo(14, 18);
        ctx.lineTo(8, 15);
        ctx.closePath();
        ctx.fill();

        // Node / Circuit Circle Core
        ctx.fillStyle = '#0D183E';
        ctx.beginPath();
        ctx.arc(0, -2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Rocket Flame
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.moveTo(-5, 15);
        ctx.lineTo(0, 25 + Math.random() * 8);
        ctx.lineTo(5, 15);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// Background Stars
const stars = Array.from({ length: 80 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2,
    alpha: Math.random()
}));

const rockets = Array.from({ length: 14 }, () => new RocketParticle());

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw Stars
    ctx.fillStyle = '#FFFFFF';
    stars.forEach(star => {
        ctx.globalAlpha = star.alpha;
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.alpha += (Math.random() - 0.5) * 0.02;
        if (star.alpha < 0.1) star.alpha = 0.1;
        if (star.alpha > 1) star.alpha = 1;
    });

    // Draw Floating Rockets
    rockets.forEach(r => {
        r.update();
        r.draw();
    });

    requestAnimationFrame(animate);
}
animate();


// --- Futuristic Countdown Timer ---
// Target Date: End of November 2026 (Nov 30, 2026 23:59:59)
const launchTarget = new Date(2026, 10, 30, 23, 59, 59).getTime();

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function updateCountdown() {
    const now = new Date().getTime();
    const distance = launchTarget - now;

    if (distance < 0) {
        daysEl.innerText = "00";
        hoursEl.innerText = "00";
        minutesEl.innerText = "00";
        secondsEl.innerText = "00";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = days < 10 ? '0' + days : days;
    hoursEl.innerText = hours < 10 ? '0' + hours : hours;
    minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
    secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;

    // Trigger audio beep tone in sync with seconds tick if audio enabled
    if (audioContext && soundActive && lastSecond !== seconds) {
        playBeep(seconds === 0 ? 880 : 440, 0.05);
        lastSecond = seconds;
    }
}
let lastSecond = -1;
setInterval(updateCountdown, 1000);
updateCountdown();


// --- Web Audio API Synthetic Audio FX ---
let audioContext = null;
let soundActive = false;

const soundBtn = document.getElementById('sound-btn');
const soundText = document.getElementById('sound-text');

soundBtn.addEventListener('click', () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!soundActive) {
        soundActive = true;
        soundText.innerText = "SONIDO DESPEGUE: ACTIVADO";
        soundBtn.style.background = "#D4AF37";
        soundBtn.style.color = "#0D183E";
        playRocketSound();
    } else {
        soundActive = false;
        soundText.innerText = "ACTIVAR EFECTO AUDIO DESPEGUE";
        soundBtn.style.background = "linear-gradient(135deg, #0D183E 0%, #16265c 100%)";
        soundBtn.style.color = "#D4AF37";
    }
});

function playBeep(freq, duration) {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    gain.gain.setValueAtTime(0.05, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
}

function playRocketSound() {
    if (!audioContext || !soundActive) return;
    // Ambient Rocket Engine Rumble synthesis (filtered noise)
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, audioContext.currentTime);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.08, audioContext.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    noise.start();
}
