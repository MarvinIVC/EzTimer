// Timer Settings
let studyDuration = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 15 * 60;
let isRunning = false;
let isPaused = false;
let timer;
let timeLeft = studyDuration;
let sequence = ['study', 'short-break', 'study', 'long-break'];
let currentSessionIndex = 0;
let streak = 0;
let points = 0;

// Shop Configuration
const shopItems = [
    { id: 'confetti', name: 'Confetti Effect', cost: 50 },
    { id: 'wallpaper', name: 'Background Wallpaper', cost: 100 },
    { id: 'ringColor', name: 'Custom Ring Color', cost: 75 }
];
const purchased = new Set();

// DOM Elements
const timeDisplay = document.getElementById('time');
const progressCircle = document.getElementById('progress');
const studyInput = document.getElementById('study-duration');
const shortBreakInput = document.getElementById('short-break');
const longBreakInput = document.getElementById('long-break');
const sessionContainer = document.getElementById('session-container');
const shopBtn = document.getElementById('shop-btn');
const shopMenu = document.querySelector('.shop-menu');
const shopList = document.getElementById('shop-items');
const closeShopBtn = document.getElementById('close-shop');

// Session Colors & Encouragement
const sessionColors = {
    'study': '#2d87f0',
    'short-break': '#5cb85c',
    'long-break': '#d9534f'
};
const encouragementMessages = [
    "Great job! 🎉",
    "You're on fire! 🔥",
    "Knowledge is power! 💪",
    "Another session conquered! 🏆",
    "Pomodoro pro! 🍅",
    "Take a well-earned break! ☕"
];

// Audio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
function playSound(frequency) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
}

// Format and Progress
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
function updateProgress(elapsed, total, session) {
    const progress = (elapsed / total) * 754;
    progressCircle.style.strokeDashoffset = 754 - progress;
    progressCircle.style.stroke = sessionColors[session];
}

// Statistics
function updateStats() {
    streak++;
    points += 10;
    document.getElementById('streak').textContent = streak;
    document.getElementById('points').textContent = points;
    document.getElementById('encouragement').textContent = encouragementMessages[
        Math.floor(Math.random() * encouragementMessages.length)
    ];
}

// Shop Rendering & Logic
function renderShop() {
    shopList.innerHTML = '';
    shopItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'shop-item';
        li.innerHTML = `
            <span>${item.name} - ${item.cost} ⭐</span>
            <button data-id="${item.id}" ${purchased.has(item.id) ? 'disabled' : ''}>
                ${purchased.has(item.id) ? 'Purchased' : 'Buy'}
            </button>
        `;
        shopList.appendChild(li);
    });
}
shopBtn.addEventListener('click', () => {
    shopMenu.classList.toggle('hidden');
    renderShop();
});
closeShopBtn.addEventListener('click', () => {
    shopMenu.classList.add('hidden');
});
shopMenu.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON' && e.target.dataset.id) {
        const item = shopItems.find(i => i.id === e.target.dataset.id);
        if (points >= item.cost && !purchased.has(item.id)) {
            points -= item.cost;
            purchased.add(item.id);
            document.getElementById('points').textContent = points;
            applyDecoration(item.id);
            renderShop();
        } else {
            alert('Not enough points!');
        }
    }
});

function applyDecoration(id) {
    const container = document.querySelector('.container');
    if (id === 'confetti') container.classList.add('has-confetti');
    if (id === 'wallpaper') container.classList.add('wallpaper-deco');
    if (id === 'ringColor') progressCircle.style.stroke = '#ff69b4';
}

// Celebration Override for Confetti
function createCelebration() {
    const emojis = ['🎉','✨','🥳','🍅','📚','🏆'];
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(celebration);
    if (purchased.has('confetti')) {
        for (let i = 0; i < 20; i++) createCelebration();
    }
    setTimeout(() => celebration.remove(), 1500);
}

// Core Timer Logic
function startTimer(duration, session) {
    let elapsed = 0;
    timeLeft = duration;
    playSound(523.25);
    document.querySelector('.container').className = `container session-theme ${session}`;
    timer = setInterval(() => {
        if (!isPaused) {
            elapsed++;
            timeLeft--;
            timeDisplay.textContent = formatTime(timeLeft);
            updateProgress(elapsed, duration, session);
            if (timeLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                playSound(783.99);
                createCelebration();
                updateStats();
                currentSessionIndex = (currentSessionIndex + 1) % sequence.length;
                startNextSession();
            }
        }
    }, 1000);
}
function startNextSession() {
    const next = sequence[currentSessionIndex];
    let dur;
    const icon = document.getElementById('theme-icon');
    if (next === 'study') {
        dur = studyInput.value * 60;
        icon.textContent = ['📚','✍️','📖','📝'][Math.floor(Math.random()*4)];
    } else if (next === 'short-break') {
        dur = shortBreakInput.value * 60;
        icon.textContent = ['☕','🛌','🎧','🍵'][Math.floor(Math.random()*4)];
    } else {
        dur = longBreakInput.value * 60;
        icon.textContent = ['🏖️','🎮','🍿','🚶♂️'][Math.floor(Math.random()*4)];
    }
    timeDisplay.textContent = formatTime(dur);
    startTimer(dur, next);
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', () => {
    if (isRunning) {
        isPaused = !isPaused;
        document.getElementById('start-btn').textContent = isPaused ? 'Resume' : 'Pause';
    } else {
        isRunning = true;
        isPaused = false;
        document.getElementById('start-btn').textContent = 'Pause';
        startNextSession();
    }
});

document.getElementById('reset-btn').addEventListener('click', () => {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    currentSessionIndex = 0;
    timeLeft = studyDuration;
    streak = 0;
    points = 0;
    document.getElementById('streak').textContent = '0';
    document.getElementById('points').textContent = '0';
    document.getElementById('encouragement').textContent = '';
    document.getElementById('start-btn').textContent = 'Start';
    timeDisplay.textContent = formatTime(studyDuration);
    updateProgress(0, studyDuration, 'study');
    document.querySelector('.container').className = 'container';
    document.getElementById('theme-icon').textContent = '📚';
});

document.getElementById('customize-btn').addEventListener('click', () => {
    document.querySelector('.customize-menu').classList.toggle('hidden');
});

// Drag & Drop for Sequence
let dragged;
sessionContainer.addEventListener('dragstart', e => {
    playSound(261.63);
    dragged = e.target;
    e.target.style.opacity = '0.5';
});
sessionContainer.addEventListener('dragend', e => {
    e.target.style.opacity = '';
});
sessionContainer.addEventListener('dragover', e => e.preventDefault());
sessionContainer.addEventListener('drop', e => {
    playSound(329.63);
    e.preventDefault();
    if (e.target.classList.contains('session')) {
        sessionContainer.insertBefore(dragged, e.target);
    }
});

document.getElementById('save-sequence').addEventListener('click', () => {
    const blocks = document.querySelectorAll('.session');
    sequence = Array.from(blocks).map(b => b.getAttribute('data-session'));
    alert('Custom sequence saved!');
});

document.getElementById('reset-sequence').addEventListener('click', () => {
    sequence = ['study','short-break','study','long-break'];
    sessionContainer.innerHTML = `
        <div class="session" draggable="true" data-session="study">Study 1</div>
        <div class="session" draggable="true" data-session="short-break">Short Break</div>
        <div class="session" draggable="true" data-session="study">Study 2</div>
        <div class="session" draggable="true" data-session="long-break">Long Break</div>
    `;
    alert('Sequence reset to default!');
});

// Dynamic Theme Styles
document.styleSheets[0].insertRule(
    `.container.study { background: linear-gradient(145deg, ${sessionColors.study}20, #fff); }`
);
document.styleSheets[0].insertRule(
    `.container.short-break { background: linear-gradient(145deg, ${sessionColors['short-break']}20, #fff); }`
);
document.styleSheets[0].insertRule(
    `.container.long-break { background: linear-gradient(145deg, ${sessionColors['long-break']}20, #fff); }`
);
