function sha256(str) {
  const buf = new TextEncoder().encode(str);
  return crypto.subtle.digest("SHA-256", buf).then(hash => {
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  });
}

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
    const newUser = {
      username: f.username.value.trim(),
      email: f.email.value.trim().toLowerCase(),
      password: hash
    };

    const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
    localUsers.push(newUser);
    localStorage.setItem("localUsers", JSON.stringify(localUsers));

    api("/signup", newUser).then(({ message }) => {
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
  try {
    const display = document.getElementById("user-display");
    const username = (display && display.textContent.replace("👤 ", "").trim()) || "guest";

    const scoreData = {
      username,
      score: typeof score === "number" ? score : 0,
      total: typeof settings.numQuestions === "number" ? settings.numQuestions : 0,
      timestamp: new Date().toISOString()
    };

    let local = [];
    try {
      const stored = localStorage.getItem("localLeaderboard");
      local = Array.isArray(JSON.parse(stored)) ? JSON.parse(stored) : [];
    } catch {
      console.warn("⚠️ Invalid or missing localLeaderboard data. Reinitializing.");
      local = [];
    }

    local.push(scoreData);
    localStorage.setItem("localLeaderboard", JSON.stringify(local));

    alert("✅ Score saved to leaderboard!");
  } catch (err) {
    console.error("❌ Failed to save score:", err);
    alert("❌ Failed to save score. Please try again.");
  }
}

function showLeaderboard() {
  const display = document.getElementById("user-display");
  const username = (display && display.textContent.replace("👤 ", "").trim()) || "guest";

  // Attempt to save the most recent score if it's not already saved
  try {
    const scoreData = {
      username,
      score: typeof score === "number" ? score : 0,
      total: typeof settings.numQuestions === "number" ? settings.numQuestions : 0,
      timestamp: new Date().toISOString()
    };

    let local = [];
    try {
      const stored = localStorage.getItem("localLeaderboard");
      local = Array.isArray(JSON.parse(stored)) ? JSON.parse(stored) : [];
    } catch {
      local = [];
    }

    const alreadySaved = local.some(entry =>
      entry.username === scoreData.username &&
      entry.score === scoreData.score &&
      entry.total === scoreData.total
    );

    if (!alreadySaved && scoreData.total > 0) {
      local.push(scoreData);
      localStorage.setItem("localLeaderboard", JSON.stringify(local));
    }
  } catch (err) {
    console.warn("⚠️ Could not auto-save score to leaderboard:", err);
  }

  // Now retrieve and display
  let localScores = [];
  try {
    localScores = JSON.parse(localStorage.getItem("localLeaderboard")) || [];
  } catch (e) {
    console.warn("⚠️ Invalid leaderboard data:", e);
    localScores = [];
  }

  localScores = localScores.filter(entry =>
    entry &&
    typeof entry.username === "string" &&
    typeof entry.score === "number" &&
    typeof entry.total === "number" &&
    typeof entry.timestamp === "string"
  );

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
            <span class="user">${entry.username || "guest"}</span>
            <span class="score">${entry.score}/${entry.total}</span>
            <span class="timestamp">${new Date(entry.timestamp).toLocaleString()}</span>
          </li>
        `).join("")}
      </ol>
    </div>`;
}

function api(path, data) {
  // Simulate a working API only for /signup, /login, /reset-request
  if (path === "/signup") {
    return Promise.resolve({ message: "Account created!" });
  } else if (path === "/login") {
    const users = JSON.parse(localStorage.getItem("localUsers") || "[]");
    const user = users.find(u =>
      (u.username === data.identifier || u.email === data.identifier) && u.password === data.password
    );
    if (user) {
      return Promise.resolve({ username: user.username });
    } else {
      return Promise.reject(new Error("Invalid username/email or password."));
    }
  } else if (path === "/reset-request") {
    return Promise.resolve({ message: "Reset link sent (simulated)." });
  }
  return Promise.reject(new Error("Endpoint not supported in static mode."));
}

showWelcome();
window.showSettings  = showSettings;
window.showLogInForm = showLogInForm;
window.showSignUpForm= showSignUpForm;
window.showWelcome   = showWelcome;   
window.startQuiz     = startQuiz;
window.saveToLeaderboard = saveToLeaderboard; // ← THIS LINE FIXES THE ISSUE

