function sha256(str) {
  const buf = new TextEncoder().encode(str);
  return crypto.subtle.digest("SHA-256", buf).then(hash => {
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  });
}

function handleSignUp(e) {
  e.preventDefault();
  const f = e.target;
  const agreed = f.querySelector("#agree-terms")?.checked;
  if (f.password.value !== f.confirm.value || !agreed) {
    card.querySelector("#signup-err").style.display = "block";
    card.querySelector("#signup-ok").style.display = "none";
    return;
  }
  sha256(f.password.value).then(hash => {
    const newUser = {
      username: f.username.value.trim(),
      email: f.email.value.trim().toLowerCase(),
      password: hash
    };
    const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
    localUsers.push(newUser);
    localStorage.setItem("localUsers", JSON.stringify(localUsers));

    f.reset();
    card.querySelector("#signup-ok").textContent = "✅ Account created!";
    card.querySelector("#signup-ok").style.display = "block";
    card.querySelector("#signup-err").style.display = "none";
  });
}

function buildSignupForm() {
  card.innerHTML = `
    ${backBtn()}
    <h1 class="title">Create Account</h1>
    <form id="signup-form" class="signup-form">
      <input name="username" placeholder="Username" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <input name="confirm" type="password" placeholder="Confirm Password" required />
      <label><input type="checkbox" id="agree-terms" required /> I agree to the terms</label>
      <button type="submit" class="start">Create Account</button>
    </form>
    <div id="signup-ok" style="display:none;color:#4caf50;margin-top:12px"></div>
    <div id="signup-err" style="display:none;color:#f44336;margin-top:12px">❌ Passwords do not match or agreement missing.</div>
  `;
  card.querySelector("#signup-form").addEventListener("submit", handleSignUp);
}

function handleLogIn(e) {
  e.preventDefault();
  const f = e.target;
  sha256(f.password.value).then(hash => {
    const users = JSON.parse(localStorage.getItem("localUsers") || "[]");
    const user = users.find(u =>
      (u.username === f.identifier.value.trim() || u.email === f.identifier.value.trim()) && u.password === hash
    );
    if (user) {
      const uDisp = document.getElementById("user-display");
      uDisp.textContent = `👤 ${user.username}`;
      uDisp.style.display = "block";
      card.querySelector("#login-ok").style.display = "block";
      card.querySelector("#login-err").style.display = "none";
      setTimeout(showWelcome, 1200);
    } else {
      card.querySelector("#login-err").style.display = "block";
    }
  });
}

function showResetForm() {
  card.innerHTML = `
    ${backBtn()}
    <h1 class="title">Reset Password</h1>
    <form id="reset-form" class="signup-form">
      <input type="email" name="email" placeholder="Enter your email" required />
      <button class="start" type="submit">Send Reset Link</button>
    </form>
    <p id="reset-msg" style="display:none;color:#4caf50;margin-top:18px">
      📧 Password reset link sent (simulated).
    </p>`;
  card.querySelector("#reset-form").onsubmit = e => {
    e.preventDefault();
    e.target.reset();
    card.querySelector("#reset-msg").style.display = "block";
  };
}

function saveToLeaderboard() {
  const display = document.getElementById("user-display");
  const username = (display && display.textContent.replace("👤 ", "").trim()) || "guest";
  const scoreData = {
    username,
    score,
    total: settings.numQuestions,
    timestamp: new Date().toISOString()
  };
  const localScores = JSON.parse(localStorage.getItem("localScores") || "[]");
  localScores.push(scoreData);
  localStorage.setItem("localScores", JSON.stringify(localScores));
  alert("✅ Score saved to leaderboard!");
}

function showLeaderboard() {
  const localScores = JSON.parse(localStorage.getItem("localScores") || "[]");
  localScores.sort((a, b) => b.score - a.score);
  const top10 = localScores.slice(0, 10);
  card.innerHTML = `
    <button class="back-arrow" onclick="showWelcome()">
      <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <h1 class="title">🏆 Leaderboard</h1>
    <p class="subtitle">Top 10 Scores</p>
    <div class="leaderboard-box">
      <ol class="leaderboard-list">
        ${top10.map((entry, i) => `
          <li class="leaderboard-entry">
            <span class="rank">#${i + 1}</span>
            <span class="user">${entry.username}</span>
            <span class="score">${entry.score}/${entry.total}</span>
            <span class="timestamp">${new Date(entry.timestamp).toLocaleString()}</span>
          </li>`).join("")}
      </ol>
    </div>`;
}
