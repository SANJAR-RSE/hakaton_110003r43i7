// Minimal in-memory per-chat session: auth token/user + the in-progress
// booking wizard selections. Good enough for a hackathon demo; if the bot
// process restarts, users just tap "Raqamni yuborish" again to relink -
// their account/data is untouched since it all lives in MongoDB via the API.
const sessions = new Map();

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { token: null, user: null, wizard: {} });
  }
  return sessions.get(chatId);
}

function resetWizard(chatId) {
  getSession(chatId).wizard = {};
}

module.exports = { getSession, resetWizard };
