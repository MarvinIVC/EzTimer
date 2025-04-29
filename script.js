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

const timeDisplay = document.getElementById('time');
const progressCircle = document.getElementById('progress');
const studyInput = document.getElementById('study-duration');
const shortBreakInput = document.getElementById('short-break');
const longBreakInput = document.getElementById('long-break');
const sessionContainer = document.getElementById('session-container');

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

function createCelebration() {
    const emojis = ['🎉', '✨', '🥳', '🍅', '📚', '🏆'];
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(celebration);
    setTimeout(() => celebration.remove(), 1500);
}

function updateStats() {
    streak++;
    points += 10;
    document.getElementById('streak').textContent = streak;
    document.getElementById('points').textContent = points;
    document.getElementById('encouragement').textContent = 
        encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
}

function updateProgress(timeElapsed, totalDuration, session) {
    const progress = (timeElapsed / totalDuration) * 754;
    progressCircle.style.strokeDashoffset = 754 - progress;
    progressCircle.style.stroke = sessionColors[session];
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function startTimer(duration, session) {
    let timeElapsed = 0;
    timeLeft = duration;
    playSound(523.25);
    
    const container = document.querySelector('.container');
    container.className = `container session-theme ${session}`;
    
    timer = setInterval(() => {
        if (!isPaused) {
            timeElapsed++;
            timeLeft--;
            timeDisplay.textContent = formatTime(timeLeft);
            updateProgress(timeElapsed, duration, session);
            
            if (timeLeft <= 0) {
                playSound(783.99);
                clearInterval(timer);
                isRunning = false;
                createCelebration();
                updateStats();
                currentSessionIndex = (currentSessionIndex + 1) % sequence.length;
                startNextSession();
            }
        }
    }, 1000);
}

function startNextSession() {
    const nextSession = sequence[currentSessionIndex];
    const themeIcon = document.getElementById('theme-icon');
    let nextDuration;
    
    if (nextSession === 'study') {
        nextDuration = studyInput.value * 60;
        themeIcon.textContent = ['📚', '✍️', '📖', '📝'][Math.floor(Math.random()*4)];
    } else if (nextSession === 'short-break') {
        nextDuration = shortBreakInput.value * 60;
        themeIcon.textContent = ['☕', '🛌', '🎧', '🍵'][Math.floor(Math.random()*4)];
    } else {
        nextDuration = longBreakInput.value * 60;
        themeIcon.textContent = ['🏖️', '🎮', '🍿', '🚶♂️'][Math.floor(Math.random()*4)];
    }

    timeDisplay.textContent = formatTime(nextDuration);
    startTimer(nextDuration, nextSession);
}

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

let dragged;
sessionContainer.addEventListener('dragstart', (e) => {
    playSound(261.63);
    dragged = e.target;
    e.target.style.opacity = 0.5;
});

sessionContainer.addEventListener('dragend', (e) => {
    e.target.style.opacity = "";
});

sessionContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
});

sessionContainer.addEventListener('drop', (e) => {
    playSound(329.63);
    e.preventDefault();
    if (e.target.classList.contains('session')) {
        sessionContainer.insertBefore(dragged, e.target);
    }
});

document.getElementById('save-sequence').addEventListener('click', () => {
    const sessionBlocks = document.querySelectorAll('.session');
    customSequence = [];
    sessionBlocks.forEach(block => {
        customSequence.push(block.getAttribute('data-session'));
    });
    sequence = customSequence;
    alert('Custom sequence saved!');
});

document.getElementById('reset-sequence').addEventListener('click', () => {
    sequence = ['study', 'short-break', 'study', 'long-break'];
    sessionContainer.innerHTML = `
        <div class="session" draggable="true" data-session="study">Study 1</div>
        <div class="session" draggable="true" data-session="short-break">Short Break</div>
        <div class="session" draggable="true" data-session="study">Study 2</div>
        <div class="session" draggable="true" data-session="long-break">Long Break</div>
    `;
    alert('Sequence reset to default!');
});

document.styleSheets[0].insertRule(`
    .container.study { background: linear-gradient(145deg, ${sessionColors.study}20, #fff); }
    .container.short-break { background: linear-gradient(145deg, ${sessionColors['short-break']}20, #fff); }
    .container.long-break { background: linear-gradient(145deg, ${sessionColors['long-break']}20, #fff); }
`);
