let studyDuration = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 15 * 60;
let isRunning = false;
let timer;
let timeLeft = studyDuration;
let sequence = ['study', 'short-break', 'study', 'long-break'];
let currentSessionIndex = 0;
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
    timer = setInterval(() => {
        timeElapsed++;
        timeLeft--;
        timeDisplay.textContent = formatTime(timeLeft);
        updateProgress(timeElapsed, duration, session);
        if (timeLeft <= 0) {
            clearInterval(timer);
            isRunning = false;
            currentSessionIndex = (currentSessionIndex + 1) % sequence.length;
            startNextSession();
        }
    }, 1000);
}


function startNextSession() {
    const nextSession = sequence[currentSessionIndex];
    let nextDuration;
    if (nextSession === 'study') nextDuration = studyInput.value * 60;
    else if (nextSession === 'short-break') nextDuration = shortBreakInput.value * 60;
    else nextDuration = longBreakInput.value * 60;

    timeDisplay.textContent = formatTime(nextDuration);
    startTimer(nextDuration, nextSession);
}


document.getElementById('start-btn').addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    startNextSession();
});


document.getElementById('reset-btn').addEventListener('click', () => {
    clearInterval(timer);
    isRunning = false;
    currentSessionIndex = 0;
    timeLeft = studyDuration;
    timeDisplay.textContent = formatTime(studyDuration);
    updateProgress(0, studyDuration, 'study');
});


document.getElementById('customize-btn').addEventListener('click', () => {
    document.querySelector('.customize-menu').classList.toggle('hidden');
});


let dragged;
sessionContainer.addEventListener('dragstart', (e) =>

 {
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
