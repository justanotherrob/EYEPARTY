require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const allQuestions = require("./questions");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Run schema on startup
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Database initialized");
  } catch (err) {
    console.error("DB init error:", err.message);
  }
}

// Store active sessions: sessionId -> { questions (with answers), startedAt }
const sessions = new Map();

// GET /api/questions — start a session, return 10 random questions (no answers)
app.get("/api/questions", (req, res) => {
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 10);
  const sessionId = Math.random().toString(36).substring(2, 15);

  sessions.set(sessionId, {
    questions: selected,
    startedAt: Date.now()
  });

  // Clean old sessions (older than 30 min)
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [id, s] of sessions) {
    if (s.startedAt < cutoff) sessions.delete(id);
  }

  const clientQuestions = selected.map((q, i) => ({
    index: i,
    question: q.question,
    options: q.options
  }));

  res.json({ sessionId, questions: clientQuestions });
});

// POST /api/check — validate an answer server-side
app.post("/api/check", (req, res) => {
  const { sessionId, questionIndex, answerIndex } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(400).json({ error: "Invalid session" });
  }

  const question = session.questions[questionIndex];
  if (!question) {
    return res.status(400).json({ error: "Invalid question index" });
  }

  const correct = answerIndex === question.correctIndex;
  res.json({ correct, correctIndex: question.correctIndex });
});

// POST /api/scores — save score, return rank
app.post("/api/scores", async (req, res) => {
  const { name, score, sessionId } = req.body;

  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Name and score required" });
  }

  // Clean up session
  if (sessionId) sessions.delete(sessionId);

  try {
    await pool.query("INSERT INTO scores (name, score) VALUES ($1, $2)", [
      name.trim().substring(0, 30),
      score
    ]);

    const rankResult = await pool.query(
      "SELECT COUNT(*) + 1 AS rank FROM scores WHERE score > $1",
      [score]
    );

    res.json({ rank: parseInt(rankResult.rows[0].rank) });
  } catch (err) {
    console.error("Save score error:", err.message);
    res.status(500).json({ error: "Failed to save score" });
  }
});

// GET /api/leaderboard — top 50 scores
app.get("/api/leaderboard", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Leaderboard error:", err.message);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`VA Bootcamp running on port ${PORT}`);
  });
});
