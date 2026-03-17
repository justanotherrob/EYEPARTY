(function () {
  const QUESTION_TIME = 10;
  const BASE_POINTS = 100;
  const MAX_SPEED_BONUS = 50;
  const FAST_THRESHOLD = 3;

  const MESSAGES = {
    correctFast: ["EAGLE EYES!", "LIGHTNING FAST!", "PERFECT VISION!", "20/20!", "SHARP!"],
    correctSlow: ["Got there!", "Phew!", "Just in time!", "Close call!", "Squeezed it!"],
    wrong: ["Needs glasses!", "Blurry!", "Ouch!", "Try contacts?", "Not quite!"],
    timeout: ["Too slow!", "Time's up!", "Blink and you missed it!", "Snoozing!", "Wake up!"]
  };

  let state = {
    name: "",
    sessionId: null,
    questions: [],
    currentQuestion: 0,
    score: 0,
    correctAnswers: 0,
    timerInterval: null,
    timeLeft: QUESTION_TIME,
    answered: false
  };

  // DOM refs
  const screens = {
    start: document.getElementById("screen-start"),
    quiz: document.getElementById("screen-quiz"),
    results: document.getElementById("screen-results")
  };

  const els = {
    nameInput: document.getElementById("name-input"),
    startBtn: document.getElementById("start-btn"),
    playerName: document.getElementById("player-name"),
    reactionMsg: document.getElementById("reaction-msg"),
    questionCounter: document.getElementById("question-counter"),
    scoreDisplay: document.getElementById("score-display"),
    timerBar: document.getElementById("timer-bar"),
    questionText: document.getElementById("question-text"),
    optionsContainer: document.getElementById("options-container"),
    finalScore: document.getElementById("final-score"),
    finalRank: document.getElementById("final-rank"),
    correctCount: document.getElementById("correct-count"),
    playAgainBtn: document.getElementById("play-again-btn")
  };

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[name].classList.add("active");
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showReaction(type) {
    const msg = randomFrom(MESSAGES[type]);
    els.reactionMsg.textContent = msg;
    els.reactionMsg.className = "reaction-msg " + type;
    els.reactionMsg.classList.add("show");
    setTimeout(() => els.reactionMsg.classList.remove("show"), 1500);
  }

  function calculateSpeedBonus(timeLeft) {
    if (timeLeft >= QUESTION_TIME - FAST_THRESHOLD) {
      return MAX_SPEED_BONUS;
    }
    const elapsed = QUESTION_TIME - timeLeft;
    const bonus = Math.round(MAX_SPEED_BONUS * (1 - elapsed / QUESTION_TIME));
    return Math.max(0, bonus);
  }

  async function startGame() {
    const name = els.nameInput.value.trim();
    if (!name) {
      els.nameInput.classList.add("shake");
      setTimeout(() => els.nameInput.classList.remove("shake"), 500);
      return;
    }

    state.name = name;
    state.currentQuestion = 0;
    state.score = 0;
    state.correctAnswers = 0;

    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      state.sessionId = data.sessionId;
      state.questions = data.questions;

      els.playerName.textContent = name;
      showScreen("quiz");
      showQuestion();
    } catch (err) {
      console.error("Failed to load questions:", err);
    }
  }

  function showQuestion() {
    const q = state.questions[state.currentQuestion];
    state.answered = false;
    state.timeLeft = QUESTION_TIME;

    els.questionCounter.textContent = `${state.currentQuestion + 1}/10`;
    els.scoreDisplay.textContent = `${state.score} pts`;
    els.questionText.textContent = q.question;
    els.reactionMsg.className = "reaction-msg";

    // Render options
    els.optionsContainer.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.addEventListener("click", () => selectAnswer(i));
      els.optionsContainer.appendChild(btn);
    });

    // Start timer
    startTimer();
  }

  function startTimer() {
    clearInterval(state.timerInterval);
    els.timerBar.style.transition = "none";
    els.timerBar.style.width = "100%";
    els.timerBar.classList.remove("urgent");

    // Force reflow then animate
    void els.timerBar.offsetWidth;
    els.timerBar.style.transition = `width ${QUESTION_TIME}s linear`;
    els.timerBar.style.width = "0%";

    const startTime = Date.now();
    state.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      state.timeLeft = Math.max(0, QUESTION_TIME - elapsed);

      if (state.timeLeft <= 3) {
        els.timerBar.classList.add("urgent");
      }

      if (state.timeLeft <= 0) {
        clearInterval(state.timerInterval);
        if (!state.answered) {
          handleTimeout();
        }
      }
    }, 100);
  }

  async function selectAnswer(answerIndex) {
    if (state.answered) return;
    state.answered = true;
    clearInterval(state.timerInterval);

    const timeLeft = state.timeLeft;

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          questionIndex: state.currentQuestion,
          answerIndex
        })
      });
      const data = await res.json();

      // Highlight buttons
      const btns = els.optionsContainer.querySelectorAll(".option-btn");
      btns.forEach((btn, i) => {
        btn.disabled = true;
        if (i === data.correctIndex) btn.classList.add("correct");
        if (i === answerIndex && !data.correct) btn.classList.add("wrong");
      });

      if (data.correct) {
        const bonus = calculateSpeedBonus(timeLeft);
        const points = BASE_POINTS + bonus;
        state.score += points;
        state.correctAnswers++;

        if (timeLeft >= QUESTION_TIME - FAST_THRESHOLD) {
          showReaction("correctFast");
        } else {
          showReaction("correctSlow");
        }
      } else {
        showReaction("wrong");
      }
    } catch (err) {
      console.error("Check answer error:", err);
    }

    setTimeout(nextQuestion, 1800);
  }

  function handleTimeout() {
    state.answered = true;
    showReaction("timeout");

    const btns = els.optionsContainer.querySelectorAll(".option-btn");
    btns.forEach(btn => (btn.disabled = true));

    // Still fetch correct answer to highlight it
    fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: state.sessionId,
        questionIndex: state.currentQuestion,
        answerIndex: -1
      })
    })
      .then(r => r.json())
      .then(data => {
        const btns = els.optionsContainer.querySelectorAll(".option-btn");
        btns.forEach((btn, i) => {
          if (i === data.correctIndex) btn.classList.add("correct");
        });
      })
      .catch(() => {});

    setTimeout(nextQuestion, 1800);
  }

  function nextQuestion() {
    state.currentQuestion++;
    if (state.currentQuestion >= state.questions.length) {
      endGame();
    } else {
      showQuestion();
    }
  }

  async function endGame() {
    clearInterval(state.timerInterval);

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          score: state.score,
          sessionId: state.sessionId
        })
      });
      const data = await res.json();

      els.finalScore.textContent = `${state.score} POINTS`;
      els.finalRank.textContent = `RANK #${data.rank}`;
      els.correctCount.textContent = `${state.correctAnswers}/10 correct`;
    } catch (err) {
      els.finalScore.textContent = `${state.score} POINTS`;
      els.finalRank.textContent = "";
      els.correctCount.textContent = `${state.correctAnswers}/10 correct`;
    }

    showScreen("results");
  }

  // Event listeners
  els.startBtn.addEventListener("click", startGame);
  els.nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startGame();
  });
  els.playAgainBtn.addEventListener("click", () => {
    els.nameInput.value = state.name;
    showScreen("start");
  });
})();
