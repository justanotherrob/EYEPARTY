(function () {
  const POLL_INTERVAL = 3000;
  const tbody = document.getElementById("leaderboard-body");
  let previousIds = new Set();

  async function fetchLeaderboard() {
    try {
      const res = await fetch("/api/leaderboard");
      const scores = await res.json();
      renderLeaderboard(scores);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
  }

  function renderLeaderboard(scores) {
    if (scores.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty-msg">Waiting for players...</td></tr>';
      return;
    }

    const newIds = new Set(scores.map((s, i) => `${s.name}-${s.score}-${i}`));

    tbody.innerHTML = scores
      .map((s, i) => {
        const id = `${s.name}-${s.score}-${i}`;
        const isNew = !previousIds.has(id);
        const rankDisplay = getRankDisplay(i + 1);
        return `<tr class="${isNew ? "new-entry" : ""}">
          <td class="col-rank">${rankDisplay}</td>
          <td class="col-name">${escapeHtml(s.name)}</td>
          <td class="col-score">${s.score}</td>
        </tr>`;
      })
      .join("");

    previousIds = newIds;
  }

  function getRankDisplay(rank) {
    if (rank === 1) return "1st";
    if (rank === 2) return "2nd";
    if (rank === 3) return "3rd";
    return rank + "th";
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Initial fetch then poll
  fetchLeaderboard();
  setInterval(fetchLeaderboard, POLL_INTERVAL);
})();
