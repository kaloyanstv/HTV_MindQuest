document.addEventListener('DOMContentLoaded', () => {
    console.log("BrainQuest JS loaded");

    let totalScore = 0;
    let currentAnswer = 0;

    const startButton = document.getElementById('start-game');
    startButton.addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        if (!username) {
            alert('Enter your name first!');
            return;
        }

        // Pick a random game
        const gameChoice = Math.floor(Math.random() * 3);
        switch (gameChoice) {
            case 0:
                mathGame(username);
                break;
            case 1:
                guessNumberGame(username);
                break;
            case 2:
                wordScrambleGame(username);
                break;
        }
    });

    // Direct game buttons
    const memoryBtn = document.getElementById('memory-match');
    const patternBtn = document.getElementById('pattern-logic');
    const timedBtn = document.getElementById('timed-math');
    const simonBtn = document.getElementById('simon-says');
    memoryBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        if (!username) { alert('Enter your name first!'); return; }
        memoryMatchGame(username);
    });
    patternBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        if (!username) { alert('Enter your name first!'); return; }
        patternLogicGame(username);
    });
    timedBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        if (!username) { alert('Enter your name first!'); return; }
        timedMathGame(username);
    });
    simonBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        if (!username) { alert('Enter your name first!'); return; }
        simonSaysGame(username);
    });

    // --------- Game functions ---------
    function mathGame(username) {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        currentAnswer = a + b;

        showQuestion(username, `Solve: ${a} + ${b} = ?`, currentAnswer);
    }

    function guessNumberGame(username) {
        currentAnswer = Math.floor(Math.random() * 10) + 1;
        showQuestion(username, `Guess a number between 1-10:`, currentAnswer);
    }

    function wordScrambleGame(username) {
        const words = ["apple", "banana", "orange", "grape"];
        const word = words[Math.floor(Math.random() * words.length)];
        currentAnswer = word;
        const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
        showQuestion(username, `Unscramble this word: ${scrambled}`, currentAnswer);
    }

    function showQuestion(username, promptText, correctAnswer) {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <p>${promptText}</p>
            <input id="answer" placeholder="Your answer" />
            <button id="submit-answer">Submit</button>
        `;

        document.getElementById('submit-answer').addEventListener('click', () => {
            let userAnswer = document.getElementById('answer').value.trim();

            let points = 0;
            if (typeof correctAnswer === "number") {
                userAnswer = parseInt(userAnswer, 10);
                if (userAnswer === correctAnswer) points = 10;
            } else {
                if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) points = 10;
            }

            totalScore += points;

            alert(points > 0 ? "Correct! +10 points" : `Wrong! The correct answer was ${correctAnswer}`);
            document.getElementById('score').innerText = `${username}'s total score: ${totalScore}`;
            gameArea.innerHTML = '';
        });
    }

    // --------- Memory Match (frontend-only) ---------
    function memoryMatchGame(username) {
        const emojis = ['🍎','🐶','🚗','⭐','🍌','🌈','⚽','🎵'];
        const deck = emojis.concat(emojis).sort(() => Math.random() - 0.5);
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = '<div id="memory-grid" class="memory-grid"></div>';
        const grid = document.getElementById('memory-grid');

        let firstIndex = -1, secondIndex = -1;
        let matched = new Array(deck.length).fill(false);
        let busy = false;
        let pairsFound = 0;

        deck.forEach((val, i) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.setAttribute('role','button');
            card.setAttribute('tabindex','0');
            card.dataset.index = i;
            card.dataset.value = val;
            card.innerText = '';
            card.addEventListener('click', () => {
                if (busy || matched[i]) return;
                flip(i, card);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
            });
            grid.appendChild(card);
        });

        function flip(i, cardEl) {
            if (firstIndex === i) return; // clicking same
            cardEl.classList.add('flipped');
            cardEl.innerText = cardEl.dataset.value;

            if (firstIndex === -1) {
                firstIndex = i;
                return;
            }
            secondIndex = i;
            busy = true;
            const firstEl = grid.querySelector(`.memory-card[data-index="${firstIndex}"]`);
            const secondEl = cardEl;
            if (firstEl.dataset.value === secondEl.dataset.value) {
                matched[firstIndex] = matched[secondIndex] = true;
                pairsFound++;
                totalScore += 10;
                document.getElementById('score').innerText = `${username}'s total score: ${totalScore}`;
                // reset
                firstIndex = secondIndex = -1;
                busy = false;
                if (pairsFound === deck.length/2) {
                    setTimeout(() => { alert('You found all pairs!'); grid.innerHTML = ''; }, 200);
                }
            } else {
                // flip back
                setTimeout(() => {
                    firstEl.classList.remove('flipped');
                    firstEl.innerText = '';
                    secondEl.classList.remove('flipped');
                    secondEl.innerText = '';
                    firstIndex = secondIndex = -1;
                    busy = false;
                }, 800);
            }
        }
    }

    // --------- Timed Math Sprint ---------
    function timedMathGame(username) {
        const gameArea = document.getElementById('game-area');
        let correct = 0;
        let total = 0;
        const duration = 20; // seconds
        let timeLeft = duration;

        function nextQuestion() {
            const a = Math.floor(Math.random()*12)+1;
            const b = Math.floor(Math.random()*12)+1;
            const ans = a + b;
            gameArea.innerHTML = `
                <div>
                    <div style="font-size:20px;margin-bottom:8px">Time left: <span id="tm-timer">${timeLeft}</span>s</div>
                    <p style="font-size:22px">${a} + ${b} = ?</p>
                    <input id="tm-answer" aria-label="answer" /> <button id="tm-submit">Submit</button>
                </div>
            `;
            document.getElementById('tm-answer').focus();
            document.getElementById('tm-submit').addEventListener('click', () => {
                const val = parseInt(document.getElementById('tm-answer').value,10);
                total++;
                if (val === ans) { correct++; totalScore += 10; }
                document.getElementById('score').innerText = `${username}'s total score: ${totalScore}`;
                // next
                if (timeLeft>0) nextQuestion();
            });
        }

        // timer
        nextQuestion();
        const timerId = setInterval(()=>{
            timeLeft--;
            const tEl = document.getElementById('tm-timer'); if (tEl) tEl.innerText = timeLeft;
            if (timeLeft<=0) {
                clearInterval(timerId);
                gameArea.innerHTML = `<p>Time's up! You answered ${correct} correct out of ${total}.</p>`;
            }
        },1000);
    }

    // --------- Simon Says (simple) ---------
    function simonSaysGame(username) {
        const colors = ['red','green','blue','yellow'];
        const colorMap = { red:'#ef4444', green:'#10b981', blue:'#3b82f6', yellow:'#f59e0b' };
        const sequence = [];
        let playerIndex = 0;
        const gameArea = document.getElementById('game-area');

        function renderButtons() {
            gameArea.innerHTML = '<div id="simon-area" style="display:flex;gap:8px;flex-wrap:wrap;max-width:320px"></div>';
            const area = document.getElementById('simon-area');
            colors.forEach(c=>{
                const b = document.createElement('button');
                b.style.background = colorMap[c]; b.style.width='80px'; b.style.height='80px'; b.style.borderRadius='8px'; b.style.border='none'; b.style.cursor='pointer';
                b.setAttribute('data-color',c);
                b.setAttribute('aria-label',c+' button');
                b.addEventListener('click', ()=> playerPress(c));
                b.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); playerPress(c);} });
                area.appendChild(b);
            });
        }

        function flashButton(col) {
            const btn = document.querySelector(`#simon-area [data-color="${col}"]`);
            if (!btn) return;
            const old = btn.style.transform;
            btn.style.transform = 'scale(1.08)';
            setTimeout(()=> btn.style.transform = old, 400);
        }

        function nextRound() {
            const pick = colors[Math.floor(Math.random()*colors.length)];
            sequence.push(pick);
            playSequence();
        }

        async function playSequence(){
            for (let c of sequence) {
                flashButton(c);
                await new Promise(r=>setTimeout(r,600));
            }
            playerIndex = 0;
        }

        function playerPress(col) {
            if (!sequence.length) return;
            flashButton(col);
            if (col === sequence[playerIndex]) {
                playerIndex++;
                if (playerIndex === sequence.length) {
                    // success
                    totalScore += 10;
                    document.getElementById('score').innerText = `${username}'s total score: ${totalScore}`;
                    setTimeout(nextRound, 600);
                }
            } else {
                alert(`Wrong! Sequence ended. You reached ${sequence.length} steps.`);
                sequence.length = 0; // reset
                gameArea.innerHTML = '';
            }
        }

        renderButtons();
        // start
        nextRound();
    }

    // --------- Pattern Logic (sequence + multiple choice) ---------
    function patternLogicGame(username) {
        const sequences = [
            { seq: [2,4,6,8], next: 10 },
            { seq: [1,1,2,3,5], next: 8 },
            { seq: [3,6,12,24], next: 48 },
            { seq: [2,3,5,7], next: 11 } // primes
        ];
        const choice = sequences[Math.floor(Math.random()*sequences.length)];
        const correct = choice.next;
        // build choices
        const choices = new Set([correct]);
        while (choices.size < 4) {
            const delta = Math.floor(Math.random()*10)-5;
            choices.add(correct + delta || correct+3);
        }
        const opts = Array.from(choices).sort(() => Math.random()-0.5);

        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `<p>Find the next number: ${choice.seq.join(', ')}, ... ?</p>`;
        const buttons = opts.map(o => `<button class="pattern-opt">${o}</button>`).join(' ');
        gameArea.innerHTML += `<div id="pattern-opts">${buttons}</div>`;

        document.querySelectorAll('#pattern-opts .pattern-opt').forEach(b => {
            b.addEventListener('click', () => {
                const val = parseInt(b.innerText,10);
                if (val === correct) {
                    totalScore += 10;
                    alert('Correct! +10');
                } else {
                    alert(`Wrong — correct was ${correct}`);
                }
                document.getElementById('score').innerText = `${username}'s total score: ${totalScore}`;
                gameArea.innerHTML = '';
            });
        });
    }
});

