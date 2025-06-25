function sha256(str) {
  const buf = new TextEncoder().encode(str);
  return crypto.subtle.digest("SHA-256", buf).then(hash => {
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  });
}

const api = async (path, data) => {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
};

function handleSignUp(e) {
  e.preventDefault();
  const f = e.target;
  const agreed = f.querySelector("#agree-terms").checked;
  if (f.password.value !== f.confirm.value || !agreed) {
    card.querySelector("#signup-err").style.display = "block";
    card.querySelector("#signup-ok").style.display = "none";
    return;
  }
  sha256(f.password.value).then(hash => {
    api("/signup", {
      username: f.username.value.trim(),
      email: f.email.value.trim().toLowerCase(),
      password: hash
    }).then(({ message }) => {
      f.reset();
      card.querySelector("#signup-ok").textContent = message;
      card.querySelector("#signup-ok").style.display = "block";
      card.querySelector("#signup-err").style.display = "none";
    }).catch(err => {
      card.querySelector("#signup-err").textContent = `❌ ${err.message}`;
      card.querySelector("#signup-err").style.display = "block";
    });
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
    <div id="signup-err" style="display:none;color:#f44336;margin-top:12px"></div>
  `;
  card.querySelector("#signup-form").addEventListener("submit", handleSignUp);
  const back = card.querySelector(".back-arrow");
  if (back) back.onclick = buildWelcome;
}

function handleLogIn(e) {
  e.preventDefault();
  const f = e.target;
  sha256(f.password.value).then(hash => {
    api("/login", {
      identifier: f.identifier.value.trim(),
      password: hash
    }).then(({ username }) => {
      const userDisplay = document.getElementById("user-display");
      if (userDisplay) {
        userDisplay.textContent = `👤 ${username}`;
        userDisplay.style.display = "block";
      }
      card.querySelector("#login-ok").style.display = "block";
      card.querySelector("#login-err").style.display = "none";
      setTimeout(buildWelcome, 1200);
    }).catch(err => {
      card.querySelector("#login-err").textContent = `❌ ${err.message}`;
      card.querySelector("#login-err").style.display = "block";
    });
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
      📧 Password reset email sent.
    </p>`;
  const back = card.querySelector(".back-arrow");
  if (back) back.onclick = buildWelcome;
  card.querySelector("#reset-form").onsubmit = e => {
    e.preventDefault();
    api("/reset-request", { email: e.target.email.value.trim() })
      .then(() => {
        e.target.reset();
        card.querySelector("#reset-msg").style.display = "block";
      })
      .catch(err => alert("❌ " + err.message));
  };
}

function saveToLeaderboard() {
  const display = document.getElementById("user-display");
  const username = (display && display.textContent.replace("👤 ", "").trim()) || "guest";

  api("/score", {
    username,
    score,
    total: settings.numQuestions,
    timestamp: new Date().toISOString()
  })
  .then(() => alert("✅ Score saved to leaderboard!"))
  .catch(err => alert("❌ Failed to save score: " + err.message));
}

function showLeaderboard() {
  fetch("/api/leaderboard")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load leaderboard");
      return res.json();
    })
    .then(data => {
      card.innerHTML = `
        <button class="back-arrow" onclick="showWelcome()">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h1 class="title">🏆 Leaderboard</h1>
        <p class="subtitle">Top 100 Scores</p>
        <div class="leaderboard-box">
          <ol class="leaderboard-list">
            ${data.map((entry, i) => `
              <li class="leaderboard-entry">
                <span class="rank">#${i + 1}</span>
                <span class="user">${entry.username}</span>
                <span class="score">${entry.score}/${entry.total}</span>
                <span class="timestamp">${new Date(entry.timestamp).toLocaleString()}</span>
              </li>
            `).join("")}
          </ol>
        </div>`;
    })
    .catch(err => {
      card.innerHTML = `
        <div class="error-box">
          <h2>❌ Unable to Load Leaderboard</h2>
          <p>${err.message}</p>
        </div>`;
    });
}

window.showLeaderboard = showLeaderboard;