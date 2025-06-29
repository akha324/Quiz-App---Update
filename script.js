// ✅ Utility: SHA-256 hash for password
async function sha256(str) {
  const buf = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ✅ Utility: pick avatar for light or dark mode
function getDefaultAvatar() {
  return document.body.classList.contains("dark")
    ? "default-avatar-white.png"
    : "default-avatar.png";
}

// ✅ Seeding static users if needed (optional for first-time demo)
if (!localStorage.getItem("localUsers")) {
  localStorage.setItem("localUsers", JSON.stringify([
    {
      username: "ashiq",
      email: "ashiq@example.com",
      password: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f" // pass123 hashed
    },
    {
      username: "guest",
      email: "guest@demo.com",
      password: "0f2c693ed9b5f2ffe3817f4a45e23be14f4918659293e5c8322c2af9ce0eecfc" // guestpass hashed
    }
  ]));
}

// ✅ Handle Sign Up
async function handleSignUp(e) {
  e.preventDefault();
  const f = e.target;
  const agreed = f.querySelector("#agree-terms")?.checked;

  if (f.password.value !== f.confirm.value || !agreed) {
    card.querySelector("#signup-err").style.display = "block";
    card.querySelector("#signup-ok").style.display = "none";
    return;
  }

  const hash = await sha256(f.password.value);

  const newUser = {
    username: f.username.value.trim(),
    email: f.email.value.trim().toLowerCase(),
    password: hash
  };

  // ✅ Store locally
  const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
  localUsers.push(newUser);
  localStorage.setItem("localUsers", JSON.stringify(localUsers));

  // ✅ Send to server
  try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });
    if (!res.ok) {
      throw new Error("Server error");
    }
  } catch (err) {
    console.warn("Could not reach server, using local only:", err);
  }

  f.reset();
  card.querySelector("#signup-ok").textContent = "✅ Account created!";
  card.querySelector("#signup-ok").style.display = "block";
  card.querySelector("#signup-err").style.display = "none";
}

// ✅ Handle Log In (local only for offline fallback)
async function handleLogIn(e) {
  e.preventDefault();
  const f = e.target;
  const id = f.identifier.value.trim().toLowerCase();
  const pw = f.password.value;

  const hash = await sha256(pw);

  const users = JSON.parse(localStorage.getItem("localUsers") || "[]");

  const user = users.find(u =>
    (u.username.toLowerCase() === id || u.email.toLowerCase() === id) &&
    u.password === hash
  );

  const msg = card.querySelector("#login-message");
  const err = card.querySelector("#login-err");

  if (user) {
    msg.style.display = "block";
    err.style.display = "none";

    const uDisp = document.getElementById("user-display");
    uDisp.textContent = `👤 ${user.username}`;
    uDisp.style.display = "block";

    // ✅ Add: status and avatar update
    const status = document.getElementById("profile-status");
    if (status) {
      status.textContent = "🟢 Online";
      status.style.color = "green"; // always green
    }

    const profileImg = document.getElementById("profile-img");
    if (profileImg) {
      profileImg.src = getDefaultAvatar();
    }

    if (f.querySelector("#remember-me")?.checked) {
      localStorage.setItem("rememberedUser", id);
    } else {
      localStorage.removeItem("rememberedUser");
    }

    setTimeout(showWelcome, 1200);
  } else {
    msg.style.display = "none";
    err.style.display = "block";
  }
}

// ✅ Build Sign Up form
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

// ✅ Build Log In form
function buildLoginForm() {
  card.innerHTML = `
    ${backBtn()}
    <h1 class="title">Log In</h1>
    <form id="login-form" class="signup-form">
      <input name="identifier" placeholder="Username or Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <label><input type="checkbox" id="remember-me" /> Remember Me</label>
      <button type="submit" class="start">Log In</button>
    </form>
    <div id="login-message" style="display:none;color:#4caf50;margin-top:12px">✅ Logged in successfully!</div>
    <div id="login-err" style="display:none;color:#f44336;margin-top:12px">❌ Invalid credentials.</div>
  `;
  card.querySelector("#login-form").addEventListener("submit", handleLogIn);
}

// ✅ Log Out handler for status + avatar too
function logOut() {
  const status = document.getElementById("profile-status");
  if (status) {
    status.textContent = "🔴 Offline";
    status.style.color = "red"; // always red
  }

  const profileImg = document.getElementById("profile-img");
  if (profileImg) {
    profileImg.src = getDefaultAvatar();
  }

  localStorage.removeItem("rememberedUser");
  showWelcome();
}

// ✅ Save score locally and to MongoDB
async function saveScore(username, score) {
  // Save locally
  const localScores = JSON.parse(localStorage.getItem("localScores") || "[]");
  localScores.push({
    username,
    score,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem("localScores", JSON.stringify(localScores));

  // Save to server (MongoDB)
  try {
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        score,
        timestamp: new Date().toISOString()
      })
    });
    if (!res.ok) {
      throw new Error("Server error saving score");
    }
  } catch (err) {
    console.warn("Could not save score to server:", err);
  }
}

// ✅ Fetch trivia questions from Open Trivia DB
async function fetchTriviaQuestions(amount = 10, category = 'any') {
  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
  if (category !== 'any') {
    url += `&category=${category}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch trivia questions");
    }
    const data = await response.json();
    return data.results; // Array of trivia questions
  } catch (err) {
    console.error("Error fetching trivia questions:", err);
    return [];
  }
}
