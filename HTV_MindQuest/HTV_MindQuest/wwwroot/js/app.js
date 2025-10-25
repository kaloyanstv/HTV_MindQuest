// Global auth token
let token = localStorage.getItem("token") || null;

// Helper to call API
async function api(path, method = "GET", data) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;
  if (data) opts.body = JSON.stringify(data);
  const res = await fetch(`/api/${path}`, opts);
  if (!res.ok) {
    console.error("API error", res.status, res.statusText);
    return null;
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Login handler
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const result = await api("auth/login", "POST", { username, password });
  if (result && result.token) {
    token = result.token;
    localStorage.setItem("token", token);
    alert("Login success!");
  } else {
    alert("Login failed");
  }
}

// Start a specific game (dispatcher)
async function startGame(key) {
  const gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = "";

  switch (key) {
    case "math_race":
      renderMathRace(gameArea, 1);
      break;
    case "word_scramble":
      renderWordScramble(gameArea, 2);
      break;
    case "logic_puzzle":
      renderLogicPuzzle(gameArea, 3);
      break;
    default:
      gameArea.innerHTML = "<p>Game not found.</p>";
  }
}

// Basic math game
function renderMathRace(area, gameId) {
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);
  area.innerHTML = `
    <div class="card">
      <h3>${a} + ${b} = ?</h3>
      <input id="answer" type="number">
      <button id="submit">Submit</button>
      <div id="info"></div>
    </div>`;
  document.getElementById("submit").onclick = async () => {
    const val = parseInt(document.getElementById("answer").value);
    const info = document.getElementById("info");
    if (val === a + b) {
      info.textContent = "Correct! +10 points";
      await api("games/result", "POST", { gameId, score: 10 });
    } else {
      info.textContent = "Wrong! Try again.";
    }
  };
}

// Basic word scramble game
function renderWordScramble(area, gameId) {
  const words = ["planet", "school", "orange", "forest"];
  const word = words[Math.floor(Math.random() * words.length)];
  const scrambled = word.split("").sort(() => 0.5 - Math.random()).join("");
  area.innerHTML = `
    <div class="card">
      <h3>Unscramble: ${scrambled}</h3>
      <input id="wsInput">
      <button id="wsBtn">Check</button>
      <div id="wsInfo"></div>
    </div>`;
  document.getElementById("wsBtn").onclick = async () => {
    const val = document.getElementById("wsInput").value.trim().toLowerCase();
    const info = document.getElementById("wsInfo");
    if (val === word) {
      info.textContent = "Correct! +20 points";
      await api("games/result", "POST", { gameId, score: 20 });
    } else {
      info.textContent = "Wrong! Try again.";
    }
  };
}

// Logic puzzle game (from continuation)
function renderLogicPuzzle(area, gameId) {
  const seqs = [
    [2, 4, 6, 8],
    [1, 1, 2, 3, 5],
    [3, 6, 12, 24]
  ];
  const s = seqs[Math.floor(Math.random() * seqs.length)];
  const next = s[s.length - 1] + (s[s.length - 1] - s[s.length - 2]);
  area.innerHTML = `
    <div class="card">
      <h3>Next number: ${s.join(", ")}, ...?</h3>
      <input id="lpAns" type="number">
      <button id="lpBtn">Submit</button>
      <div id="lpInfo"></div>
    </div>`;
  document.getElementById("lpBtn").onclick = async () => {
    const val = parseInt(document.getElementById("lpAns").value);
    const info = document.getElementById("lpInfo");
    if (val === next) {
      info.textContent = "Correct! +30 points";
      await api("games/result", "POST", { gameId, score: 30 });
    } else {
      info.textContent = "Try again.";
    }
  };
}
